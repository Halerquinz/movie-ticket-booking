import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export class TokenPublicKey {
    constructor(public id: number, public data: string) { }
}

export interface TokenPublicKeyDataAccessor {
    createTokenPublicKey(data: string): Promise<number>;
    getTokenPublicKey(id: number): Promise<TokenPublicKey | null>;
}

const TabNameUserServiceTokenPublicKey = "user_service_token_public_key_tab";
const ColNameUserServiceTokenPublicKeyId = "public_key_id";
const ColNameUserServiceTokenPublicKeyData = "data";

export class TokenPublicKeyDataAccessorImpl implements TokenPublicKeyDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) { }

    public async createTokenPublicKey(data: string): Promise<number> {
        try {
            const rows = await this.knex
                .insert({ [ColNameUserServiceTokenPublicKeyData]: data })
                .returning(ColNameUserServiceTokenPublicKeyId)
                .into(TabNameUserServiceTokenPublicKey);
            return +rows[0][ColNameUserServiceTokenPublicKeyId];
        } catch (error) {
            this.logger.error("failed to create token public key", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getTokenPublicKey(id: number): Promise<TokenPublicKey | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select(ColNameUserServiceTokenPublicKeyData)
                .from(TabNameUserServiceTokenPublicKey)
                .where({ [ColNameUserServiceTokenPublicKeyId]: id })
        } catch (error) {
            this.logger.error("failed to get token public key by id", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no token public key with id found", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one token public key with id found", { id });
            throw new ErrorWithStatus("more than one token public key was found", status.INTERNAL);
        }

        return this.getTokenPublicKeyFromRow(rows[0]);
    }

    private getTokenPublicKeyFromRow(row: Record<string, any>): TokenPublicKey {
        return new TokenPublicKey(+row[ColNameUserServiceTokenPublicKeyId], row[ColNameUserServiceTokenPublicKeyData]);
    }
}

injected(TokenPublicKeyDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN = token<TokenPublicKeyDataAccessor>("TokenPublicKeyDataAccessor");