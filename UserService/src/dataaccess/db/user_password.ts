import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export interface UserPasswordDataAccessor {
    createUserPassword(ofUserId: number, hash: string): Promise<void>;
    updateUserPassword(ofUserId: number, hash: string): Promise<void>;
    getUserPasswordHash(ofUserId: number): Promise<string | null>;
    getUserPasswordHashWithXLock(ofUserId: number): Promise<string | null>;
    withTransaction<T>(cb: (dataAccessor: UserPasswordDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameUserServiceUserPassword = "user_service_password_tab";
const ColNameUserServiceUserPasswordOfUserId = "of_user_id";
const ColNameUserServiceUserPasswordHash = "hash";

export class UserPasswordDataAccessorImpl implements UserPasswordDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) { }

    public async createUserPassword(ofUserId: number, hash: string): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceUserPasswordOfUserId]: ofUserId,
                    [ColNameUserServiceUserPasswordHash]: hash
                })
                .into(TabNameUserServiceUserPassword);
        } catch (error) {
            this.logger.error("failed to create user password", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUserPassword(ofUserId: number, hash: string): Promise<void> {
        try {
            await this.knex
                .table(TabNameUserServiceUserPassword)
                .update({
                    [ColNameUserServiceUserPasswordHash]: hash,
                })
                .where({
                    [ColNameUserServiceUserPasswordOfUserId]: ofUserId,
                });
        } catch (error) {
            this.logger.error("failed to update user password", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserPasswordHash(ofUserId: number): Promise<string | null> {
        let rows;
        try {
            rows = await this.knex
                .select([ColNameUserServiceUserPasswordHash])
                .from(TabNameUserServiceUserPassword)
                .where({
                    [ColNameUserServiceUserPasswordOfUserId]: ofUserId,
                });
        } catch (error) {
            this.logger.error("failed to get user password hash", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no user password of user_id found", {
                userId: ofUserId,
            });
            return null;
        }

        return rows[0][ColNameUserServiceUserPasswordHash];
    }


    public async getUserPasswordHashWithXLock(ofUserId: number): Promise<string | null> {
        let rows;
        try {
            rows = await this.knex
                .select([ColNameUserServiceUserPasswordHash])
                .from(TabNameUserServiceUserPassword)
                .where({
                    [ColNameUserServiceUserPasswordOfUserId]: ofUserId,
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user password hash", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no user password of user_id found", {
                userId: ofUserId,
            });
            return null;
        }

        return rows[0][ColNameUserServiceUserPasswordHash];
    }


    public async withTransaction<T>(cb: (dataAccessor: UserPasswordDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (trx) => {
            const trxDataAccessor = new UserPasswordDataAccessorImpl(trx, this.logger);
            return cb(trxDataAccessor);
        });
    }
}

injected(UserPasswordDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_PASSWORD_DATA_ACCESSOR_TOKEN = token<UserPasswordDataAccessor>("UserPasswordDataAccessor");