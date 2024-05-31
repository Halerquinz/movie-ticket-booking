import { Logger } from "winston";
import { TOKEN_CONFIG_TOKEN, TokenConfig } from "../../config";
import { TOKEN_PUBLIC_KEY_CACHE_DM_TOKEN, TokenPublicKeyCacheDM } from "../../dataaccess/cache";
import { TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN, TokenPublicKeyDataAccessor } from "../../dataaccess/db";
import { ErrorWithStatus, ID_GENERATOR_TOKEN, IdGenerator, LOGGER_TOKEN } from "../../utils";
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { status } from "@grpc/grpc-js";
import { generateKeyPairSync } from "crypto";
import { AsyncFactory, injected, token } from "brandi";

export class DecodeTokenResult {
    constructor(public tokenId: number, public userId: number, public expireAt: number) { }
}

export interface TokenGenerator {
    generate(userId: number): Promise<string>,
    decode(token: string): Promise<DecodeTokenResult>;
}

export class JWTGenerator implements TokenGenerator {
    private tokenPublicKeyId = 0;
    private tokenPrivateKey = "";

    constructor(
        private readonly tokenPublicKeyDataAccessor: TokenPublicKeyDataAccessor,
        private readonly tokenPublicKeyCacheDM: TokenPublicKeyCacheDM,
        private readonly idGenerator: IdGenerator,
        private readonly logger: Logger,
        private readonly tokenConfig: TokenConfig
    ) { }

    public static async New(
        tokenPublicKeyDataAccessor: TokenPublicKeyDataAccessor,
        tokenPublicKeyCacheDM: TokenPublicKeyCacheDM,
        idGenerator: IdGenerator,
        logger: Logger,
        tokenConfig: TokenConfig
    ): Promise<JWTGenerator> {
        const jwtGenerator = new JWTGenerator(
            tokenPublicKeyDataAccessor,
            tokenPublicKeyCacheDM,
            idGenerator,
            logger,
            tokenConfig
        );

        const keyPair = generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

        jwtGenerator.tokenPrivateKey = keyPair.privateKey;
        jwtGenerator.tokenPublicKeyId = await tokenPublicKeyDataAccessor.createTokenPublicKey(keyPair.publicKey);

        return jwtGenerator;
    }

    public async generate(userId: number): Promise<string> {
        const jwtid = await this.idGenerator.generate();
        const signOptions: SignOptions = {
            algorithm: "RS512",
            jwtid: jwtid.toString(),
            subject: userId.toString(),
            expiresIn: this.tokenConfig.jwtExpireTime,
            keyid: `${this.tokenPublicKeyId}`
        };

        return new Promise<string>((resolve, reject) => {
            jwt.sign({}, this.tokenPrivateKey, signOptions, (error, encodedJwt) => {
                if (error) {
                    this.logger.error("failed to sign jwt token", { error });
                    return reject(new ErrorWithStatus("failed to sign jwt token", status.INTERNAL));
                }
                resolve(String(encodedJwt));
            });
        });
    }

    public async decode(token: string): Promise<DecodeTokenResult> {
        const verifyOptions: VerifyOptions = {
            algorithms: ["RS512"]
        };

        return new Promise<DecodeTokenResult>((resolve, reject) => {
            jwt.verify(
                token,
                (headers, callback) => {
                    if (headers.kid === undefined) {
                        callback(new ErrorWithStatus("cannot found keyid in headers", status.UNAUTHENTICATED));
                        return;
                    }

                    this.getTokenPublicKey(+headers.kid).then(
                        (tokenPublicKey) => {
                            callback(null, tokenPublicKey);
                        }, (error) => {
                            callback(error);
                        });
                },
                verifyOptions,
                (error, decoded: any) => {
                    if (error) {
                        if (error instanceof jwt.TokenExpiredError) {
                            return reject(new ErrorWithStatus("token expired", status.UNAUTHENTICATED));
                        }

                        return reject(new ErrorWithStatus("invalid token", status.UNAUTHENTICATED));
                    }

                    resolve(new DecodeTokenResult(+decoded["jti"], +decoded["sub"], +decoded["exp"] * 1000));
                }
            );
        });
    }

    private async getTokenPublicKey(keyId: number): Promise<string> {
        try {
            const tokenPublicKey = await this.tokenPublicKeyCacheDM.get(keyId);
            return tokenPublicKey;
        } catch (error) {
            this.logger.warn("cannot get token public key from cache", { keyId, error });
        }

        const tokenPublicKey = await this.tokenPublicKeyDataAccessor.getTokenPublicKey(keyId);
        if (tokenPublicKey === null) {
            throw new ErrorWithStatus("cannot found token public key", status.NOT_FOUND);
        }

        try {
            await this.tokenPublicKeyCacheDM.set(keyId, tokenPublicKey.data);
        } catch (error) {
            this.logger.warn("cannot set token public key to cache", { keyId, error });
        }

        return tokenPublicKey.data;
    }
}

injected(
    JWTGenerator.New,
    TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN,
    TOKEN_PUBLIC_KEY_CACHE_DM_TOKEN,
    ID_GENERATOR_TOKEN, LOGGER_TOKEN,
    TOKEN_CONFIG_TOKEN
);

export const TOKEN_GENERATOR_TOKEN = token<TokenGenerator>("TokenGenerator");
export const TOKEN_GENERATOR_FACTORY_TOKEN = token<AsyncFactory<TokenGenerator>>("AsyncFactory<TokenGenerator>");