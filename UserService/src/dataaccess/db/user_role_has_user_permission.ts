import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { UserPermission } from "./user_permission";

export interface UserRoleHasUserPermissionDataAccessor {
    createUserRoleHasUserPermission(userRoleId: number, userPermissionId: number): Promise<void>;
    deleteUserRoleHasUserPermission(userRoleId: number, userPermissionId: number): Promise<void>;
    getUserPermissionListOfUserRoleList(userRoleIdList: number[]): Promise<UserPermission[][]>;
    getUserRoleHasUserPermissionWithXLock(
        userRoleId: number, userPermissionId: number
    ): Promise<{ userRoleId: number; userPermissionId: number } | null>;
    withTransaction<T>(cb: (dataAccessor: UserRoleHasUserPermissionDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameUserServiceUserRoleHasUserPermission = "user_service_user_role_has_user_permission_tab";
const ColNameUserServiceUserRoleHasUserPermissionUserRoleId = "user_role_id";
const ColNameUserServiceUserRoleHasUserPermissionUserPermissionId = "user_permission_id";

const TabNameUserServiceUserPermission = "user_service_user_permission_tab";
const ColNameUserServiceUserPermissionId = "user_permission_id";
const ColNameUserServiceUserPermissionPermissionName = "permission_name";
const ColNameUserServiceUserPermissionDescription = "description";

export class UserRoleHasUserPermissionDataAccessorImpl implements UserRoleHasUserPermissionDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) { }

    public async createUserRoleHasUserPermission(userRoleId: number, userPermissionId: number): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceUserRoleHasUserPermissionUserRoleId]:
                        userRoleId,
                    [ColNameUserServiceUserRoleHasUserPermissionUserPermissionId]:
                        userPermissionId,
                })
                .into(TabNameUserServiceUserRoleHasUserPermission);
        } catch (error) {
            this.logger.error("failed to create user role has user permission relation", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserRoleHasUserPermission(userRoleId: number, userPermissionId: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserRoleHasUserPermission)
                .where({
                    [ColNameUserServiceUserRoleHasUserPermissionUserRoleId]:
                        userRoleId,
                    [ColNameUserServiceUserRoleHasUserPermissionUserPermissionId]:
                        userPermissionId,
                });
        } catch (error) {
            this.logger.error("failed to create user role has user permission relation", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no user role has user permission relation found", { userRoleId }, { userPermissionId });
            throw new ErrorWithStatus(
                `no user role has user permission relation found with user_role_id ${userRoleId}, user_permission_id ${userPermissionId}`,
                status.NOT_FOUND
            );
        }
    }

    public async getUserPermissionListOfUserRoleList(userRoleIdList: number[]): Promise<UserPermission[][]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRoleHasUserPermission)
                .join(
                    TabNameUserServiceUserPermission,
                    `${TabNameUserServiceUserRoleHasUserPermission}.${ColNameUserServiceUserRoleHasUserPermissionUserPermissionId}`,
                    `${TabNameUserServiceUserPermission}.${ColNameUserServiceUserPermissionId}`
                )
                .whereIn(ColNameUserServiceUserRoleHasUserPermissionUserRoleId, userRoleIdList)
                .orderBy(ColNameUserServiceUserRoleHasUserPermissionUserRoleId, "asc");

            const userRoleIdToUserPermissionList = new Map<number, UserPermission[]>();
            for (const row of rows) {
                const userRoleId = row[ColNameUserServiceUserRoleHasUserPermissionUserRoleId];
                if (!userRoleIdToUserPermissionList.has(userRoleId)) {
                    userRoleIdToUserPermissionList.set(userRoleId, []);
                }
                userRoleIdToUserPermissionList
                    .get(userRoleId)
                    ?.push(
                        new UserPermission(
                            +row[ColNameUserServiceUserRoleHasUserPermissionUserPermissionId],
                            row[ColNameUserServiceUserPermissionPermissionName],
                            row[ColNameUserServiceUserPermissionDescription]
                        )
                    );
            }

            const results: UserPermission[][] = [];
            for (const userRoleId of userRoleIdList) {
                results.push(userRoleIdToUserPermissionList.get(userRoleId) || []);
            }

            return results;
        } catch (error) {
            this.logger.error("failed to get user permission list of user role id list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserRoleHasUserPermissionWithXLock(userRoleId: number, userPermissionId: number): Promise<{ userRoleId: number; userPermissionId: number } | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRoleHasUserPermission)
                .where({
                    [ColNameUserServiceUserRoleHasUserPermissionUserRoleId]:
                        userRoleId,
                    [ColNameUserServiceUserRoleHasUserPermissionUserPermissionId]:
                        userPermissionId,
                })
                .forUpdate();

            if (rows.length == 0) {
                this.logger.debug("no user role has user permission relation found", { userRoleId }, { userPermissionId });
                return null;
            }

            if (rows.length > 1) {
                this.logger.error("more than one user role has user permission relation found", { userRoleId, userPermissionId });
                throw new ErrorWithStatus("more than one user role has user permission relation found", status.INTERNAL);
            }

            return {
                userRoleId:
                    +rows[0][
                    ColNameUserServiceUserRoleHasUserPermissionUserRoleId
                    ],
                userPermissionId:
                    +rows[0][
                    ColNameUserServiceUserRoleHasUserPermissionUserPermissionId
                    ],
            };
        } catch (error) {
            this.logger.error("failed to get user role has user permission relation", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: UserRoleHasUserPermissionDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserRoleHasUserPermissionDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(UserRoleHasUserPermissionDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN =
    token<UserRoleHasUserPermissionDataAccessor>("UserRoleHasUserPermissionDataAccessor");

