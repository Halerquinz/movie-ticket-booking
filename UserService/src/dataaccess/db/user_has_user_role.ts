import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { UserRole } from "./user_role";

export interface UserHasUserRoleDataAccessor {
    createUserHasUserRole(userId: number, userRoleId: number): Promise<void>;
    deleteUserHasUserRole(userId: number, userRoleId: number): Promise<void>;
    getUserRoleListOfUserList(userIdList: number[]): Promise<UserRole[][]>;
    getUserRoleIdListOfUser(userId: number): Promise<number[]>;
    getUserIdListOfUserRoleList(userRoleIdList: number[]): Promise<number[]>;
    getUserHasUserRoleWithXLock(
        userId: number,
        userRoleId: number
    ): Promise<{ userId: number; userRoleId: number } | null>;
    withTransaction<T>(cb: (dataAccessor: UserHasUserRoleDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameUserServiceUserHasUserRole = "user_service_user_has_user_role_tab";
const ColNameUserServiceUserHasUserRoleUserId = "user_id";
const ColNameUserServiceUserHasUserRoleUserRoleId = "user_role_id";

const TabNameUserServiceUserRole = "user_service_user_role_tab";
const ColNameUserServiceUserRoleId = "user_role_id";
const ColNameUserServiceUserRoleDisplayName = "display_name";
const ColNameUserServiceUserRoleDescription = "description";

export class UserHasUserRoleDataAccessorImpl implements UserHasUserRoleDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) { }

    public async createUserHasUserRole(userId: number, userRoleId: number): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceUserHasUserRoleUserId]: userId,
                    [ColNameUserServiceUserHasUserRoleUserRoleId]: userRoleId
                })
                .into(TabNameUserServiceUserHasUserRole);
        } catch (error) {
            this.logger.error("failed to create user has user role relation", { error, });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserHasUserRole(userId: number, userRoleId: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserHasUserRole)
                .where({
                    [ColNameUserServiceUserHasUserRoleUserId]: userId,
                    [ColNameUserServiceUserHasUserRoleUserRoleId]: userRoleId,
                });
        } catch (error) {
            this.logger.error("failed to create user has user role relation", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no user has user role relation found", { userId }, { userRoleId });
            throw new ErrorWithStatus(
                `no user has user role relation found with user_id ${userId}, user_role_id ${userRoleId}`,
                status.NOT_FOUND
            );
        }
    }

    public async getUserRoleListOfUserList(userIdList: number[]): Promise<UserRole[][]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserRole)
                .join(
                    TabNameUserServiceUserRole,
                    `${TabNameUserServiceUserHasUserRole}.${ColNameUserServiceUserHasUserRoleUserRoleId}`,
                    `${TabNameUserServiceUserRole}.${ColNameUserServiceUserRoleId}`
                )
                .whereIn(ColNameUserServiceUserHasUserRoleUserId, userIdList)
                .orderBy(ColNameUserServiceUserHasUserRoleUserId, "asc");

            const userIdToUserRoleList = new Map<number, UserRole[]>();
            for (const row of rows) {
                const userId = row[ColNameUserServiceUserHasUserRoleUserId];
                if (!userIdToUserRoleList.has(userId)) {
                    userIdToUserRoleList.set(userId, []);
                }
                userIdToUserRoleList
                    .get(userId)
                    ?.push(
                        new UserRole(
                            +row[ColNameUserServiceUserHasUserRoleUserRoleId],
                            row[ColNameUserServiceUserRoleDisplayName],
                            row[ColNameUserServiceUserRoleDescription]
                        )
                    );
            }

            const results: UserRole[][] = [];
            for (const userId of userIdList) {
                results.push(userIdToUserRoleList.get(userId) || []);
            }

            return results;
        } catch (error) {
            this.logger.error("failed to get user role list of user id list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserRoleIdListOfUser(userId: number): Promise<number[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserRole)
                .where({
                    [ColNameUserServiceUserHasUserRoleUserId]: userId
                })
                .orderBy(ColNameUserServiceUserHasUserRoleUserRoleId, "asc");
            return rows.map((row) => +row[ColNameUserServiceUserHasUserRoleUserRoleId]);
        } catch (error) {
            this.logger.error("failed to get user role id list of user id", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserIdListOfUserRoleList(userRoleIdList: number[]): Promise<number[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserRole)
                .whereIn(ColNameUserServiceUserHasUserRoleUserRoleId, userRoleIdList)
                .orderBy(ColNameUserServiceUserHasUserRoleUserId, "asc");
            return rows.map((row) => +row[ColNameUserServiceUserHasUserRoleUserId]);
        } catch (error) {
            this.logger.error("failed to get user id list of user role id list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserHasUserRoleWithXLock(
        userId: number,
        userRoleId: number
    ): Promise<{ userId: number; userRoleId: number } | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserRole)
                .where({
                    [ColNameUserServiceUserHasUserRoleUserId]: userId,
                    [ColNameUserServiceUserHasUserRoleUserRoleId]: userRoleId,
                })
                .forUpdate();

            if (rows.length == 0) {
                this.logger.debug("no user has user role relation found", { userId }, { userRoleId });
                return null;
            }

            if (rows.length > 1) {
                this.logger.error("more than one user has user role relation found", { userId, userRoleId });
                throw new ErrorWithStatus("more than one user has user role relation found", status.INTERNAL);
            }

            return {
                userId: +rows[0][ColNameUserServiceUserHasUserRoleUserId],
                userRoleId: +rows[0][ColNameUserServiceUserHasUserRoleUserRoleId],
            };
        } catch (error) {
            this.logger.error("failed to get user has user role relation", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: UserHasUserRoleDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserHasUserRoleDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(UserHasUserRoleDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN = token<UserHasUserRoleDataAccessor>("UserHasUserRoleDataAccessor");
