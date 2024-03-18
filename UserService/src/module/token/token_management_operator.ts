import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { TOKEN_CONFIG_TOKEN, TokenConfig } from "../../config";
import { BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN, BlacklistedTokenDataAccessor, USER_DATA_ACCESSOR_TOKEN, User, UserDataAccessor } from "../../dataaccess/db";
import { TOKEN_GENERATOR_TOKEN, TokenGenerator } from "./generator";
import { status } from "@grpc/grpc-js";
import ms from "ms";
import { injected, token } from "brandi";

export interface TokenManagementOperator {
    getUserFromToken(token: string): Promise<{ user: User | null; newToken: string | null }>;
    blacklistToken(token: string): Promise<void>;
    deleteExpiredBlacklistedToken(requestTime: number): Promise<number>;
}

export class TokenManagementOperatorImpl implements TokenManagementOperator {
    public renewTimeInMS: number;

    constructor(
        private readonly userDM: UserDataAccessor,
        private readonly tokenGenerator: TokenGenerator,
        private readonly blacklistedTokenDM: BlacklistedTokenDataAccessor,
        private readonly tokenConfig: TokenConfig,
        private readonly timer: Timer,
        private readonly logger: Logger,
    ) {
        this.renewTimeInMS = ms(this.tokenConfig.jwtRenewTime);
    }

    public async getUserFromToken(token: string): Promise<{ user: User | null; newToken: string | null; }> {
        const requestTime = this.timer.getCurrentTime();
        const decodeTokenResult = await this.tokenGenerator.decode(token);
        if (await this.isTokenBlacklisted(decodeTokenResult.tokenId)) {
            this.logger.info("token is blacklisted", {
                tokenId: decodeTokenResult.tokenId,
            });
            throw new ErrorWithStatus("token is blacklisted", status.UNAUTHENTICATED);
        }

        const user = await this.userDM.getUserByUserId(decodeTokenResult.userId);
        if (user === null) {
            this.logger.info("can not found user with userId", {
                user
            });
            throw new ErrorWithStatus(`cannot found user with userId ${decodeTokenResult.userId}`, status.UNAUTHENTICATED);
        }

        let newToken = null;
        if (this.isTokenNearExpireTime(requestTime, decodeTokenResult.expireAt)) {
            newToken = await this.tokenGenerator.generate(decodeTokenResult.userId);
        }

        return { user, newToken };
    }

    public async blacklistToken(token: string): Promise<void> {
        const decodeTokenResult = await this.tokenGenerator.decode(token);

        return this.blacklistedTokenDM.withTransaction(async (dm) => {
            const expireAt = await dm.getBlacklistedTokenExpireAtWithXLock(decodeTokenResult.tokenId);
            if (expireAt !== null) {
                this.logger.info("token is blacklisted", {
                    tokenId: decodeTokenResult.tokenId,
                });
                throw new ErrorWithStatus("token is blacklisted", status.UNAUTHENTICATED);
            }

            await dm.createBlacklistedToken(decodeTokenResult.tokenId, decodeTokenResult.expireAt);
        })
    }

    public async deleteExpiredBlacklistedToken(requestTime: number): Promise<number> {
        const deletedTokenCount = await this.blacklistedTokenDM.deleteExpiredBlacklistedToken(requestTime);
        if (deletedTokenCount == 0) {
            this.logger.info("no token is expired", {
                deleteToken: deletedTokenCount,
            });
        }
        return deletedTokenCount;
    }

    private async isTokenBlacklisted(tokenId: number): Promise<boolean> {
        const expireAt = await this.blacklistedTokenDM.getBlacklistedTokenExpireAt(tokenId);
        return expireAt !== null;
    }

    private isTokenNearExpireTime(requestTime: number, expireAt: number): boolean {
        return requestTime + this.renewTimeInMS >= expireAt;
    }
}

injected(
    TokenManagementOperatorImpl,
    USER_DATA_ACCESSOR_TOKEN,
    TOKEN_GENERATOR_TOKEN,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
    TOKEN_CONFIG_TOKEN,
    TIMER_TOKEN,
    LOGGER_TOKEN
);

export const TOKEN_MANAGEMENT_OPERATOR_TOKEN = token<TokenManagementOperator>("TokenManagementOperator");