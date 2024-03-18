import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KNEX_INSTANCE_TOKEN } from "./knex";

const TabNameUserServiceBlacklistedToken = "user_service_blacklisted_token_tab";
const ColNameUserServiceBlacklistedTokenId = "token_id";
const ColNameUserServiceBlacklistedTokenExpireAt = "expire_at";

export interface BlacklistedTokenDataAccessor {
    createBlacklistedToken(tokenId: number, expireAt: number): Promise<void>;
    deleteExpiredBlacklistedToken(requestTime: number): Promise<number>;
    getBlacklistedTokenExpireAt(tokenId: number): Promise<number | null>;
    getBlacklistedTokenExpireAtWithXLock(tokenId: number): Promise<number | null>;
    withTransaction<T>(cb: (dataAccessor: BlacklistedTokenDataAccessor) => Promise<T>): Promise<T>;
}

export class BlacklistedTokenDataAccessorImpl implements BlacklistedTokenDataAccessor {
    constructor(private readonly knex: Knex<any, any>, private readonly logger: Logger) { }

    public async createBlacklistedToken(tokenId: number, expireAt: number): Promise<void> {
        try {
            await this.knex.
                insert({
                    [ColNameUserServiceBlacklistedTokenId]: tokenId,
                    [ColNameUserServiceBlacklistedTokenExpireAt]: expireAt
                })
                .into(TabNameUserServiceBlacklistedToken);
        } catch (error) {
            this.logger.error("fail to create blacklisted token", {
                tokenId,
                expireAt,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteExpiredBlacklistedToken(requestTime: number): Promise<number> {
        try {
            const deleteCount = await this.knex
                .delete()
                .from(TabNameUserServiceBlacklistedToken)
                .where(
                    ColNameUserServiceBlacklistedTokenExpireAt,
                    "<=",
                    requestTime
                );
            return deleteCount;
        } catch (error) {
            this.logger.error("fail to delete expired blacklisted token", {
                requestTime,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBlacklistedTokenExpireAt(tokenId: number): Promise<number | null> {
        try {
            const rows = await this.knex
                .select([ColNameUserServiceBlacklistedTokenExpireAt])
                .from(TabNameUserServiceBlacklistedToken)
                .where(ColNameUserServiceBlacklistedTokenId, "=", tokenId);
            if (rows.length !== 1) {
                return null;
            }
            return +rows[0][ColNameUserServiceBlacklistedTokenExpireAt];
        } catch (error) {
            this.logger.error("fail to get blacklisted token expired", {
                tokenId,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBlacklistedTokenExpireAtWithXLock(tokenId: number): Promise<number | null> {
        try {
            const rows = await this.knex
                .select([ColNameUserServiceBlacklistedTokenExpireAt])
                .from(TabNameUserServiceBlacklistedToken)
                .where(ColNameUserServiceBlacklistedTokenId, "=", tokenId)
                .forUpdate();
            if (rows.length !== 1) {
                return null;
            }
            return +rows[0][ColNameUserServiceBlacklistedTokenExpireAt];
        } catch (error) {
            this.logger.error("fail to get blacklisted token expired", {
                tokenId,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: BlacklistedTokenDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction((trx) => {
            const trxDataAccessor = new BlacklistedTokenDataAccessorImpl(trx, this.logger);
            cb(trxDataAccessor);
        });
    }
}

injected(BlacklistedTokenDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN = token<BlacklistedTokenDataAccessor>("BlacklistedTokenDataAccessor");