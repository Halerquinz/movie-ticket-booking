import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export class UserRole {
    constructor(public id: number, public displayName: string, public description: string) { }
}

export interface UserRoleDataAccessor {
    createUserRole(displayName: string, description: string): Promise<number>;
    updateUserRole(userRole: UserRole): Promise<void>;
    deleteUserRole(id: number): Promise<void>;
    getUserRole(id: number): Promise<UserRole | null>;
    getUserRoleCount(): Promise<number>;
    getUserRoleWithXLock(id: number): Promise<UserRole | null>;
    withTransaction<T>(cb: (dataAccessor: UserRoleDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameUserServiceUserRole = "user_service_user_role_tab";
const ColNameUserServiceUserRoleId = "user_role_id";
const ColNameUserServiceUserRoleDisplayName = "display_name";
const ColNameUserServiceUserRoleDescription = "description";

export class UserRoleDataAccessorImpl implements UserRoleDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) { }

    public async createUserRole(displayName: string, description: string): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameUserServiceUserRoleDisplayName]: displayName,
                    [ColNameUserServiceUserRoleDescription]: description
                })
                .returning(ColNameUserServiceUserRoleId)
                .into(TabNameUserServiceUserRole);
            return +rows[0][ColNameUserServiceUserRoleId];
        } catch (error) {
            this.logger.error("failed to create user role", { displayName, description, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUserRole(userRole: UserRole): Promise<void> {
        try {
            await this.knex
                .table(TabNameUserServiceUserRole)
                .update({
                    [ColNameUserServiceUserRoleDisplayName]:
                        userRole.displayName,
                    [ColNameUserServiceUserRoleDescription]:
                        userRole.description
                })
                .where({
                    [ColNameUserServiceUserRoleId]: userRole.id
                });
        } catch (error) {
            this.logger.error("failed to update user role", { userRole, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserRole(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserRole)
                .where({
                    [ColNameUserServiceUserRoleId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete user role", { userRoleId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.error("no user role with user_role_id found", { userRoleId: id, });
            throw new ErrorWithStatus(`no user role with user_role_id ${id} found`, status.NOT_FOUND);
        }
    }

    public async getUserRole(id: number): Promise<UserRole | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRole)
                .where({
                    [ColNameUserServiceUserRoleId]: id
                });
        } catch (error) {
            this.logger.error("failed to get user role by user_role_id", { userRoleId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user role with user_role_id found", { userRoleId: id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", { userRoleId: id });
            throw new ErrorWithStatus("more than one user role was found", status.INTERNAL);
        }

        return this.getUserRoleFromRow(rows[0]);
    }

    public async getUserRoleWithXLock(id: number): Promise<UserRole | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRole)
                .where({
                    [ColNameUserServiceUserRoleId]: id
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user role by user_role_id", { userRoleId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user role with user_role_id found", { userRoleId: id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", { serRoleId: id });
            throw new ErrorWithStatus("more than one user role was found", status.INTERNAL);
        }

        return this.getUserRoleFromRow(rows[0]);
    }

    public async getUserRoleCount(): Promise<number> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex.count().from(TabNameUserServiceUserRole);
        } catch (error) {
            this.logger.error("failed to get user role count", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        return +rows[0]["count"];
    }

    private getUserRoleFromRow(row: Record<string, any>): UserRole {
        return new UserRole(
            +row[ColNameUserServiceUserRoleId],
            row[ColNameUserServiceUserRoleDisplayName],
            row[ColNameUserServiceUserRoleDescription]
        );
    }

    public async withTransaction<T>(cb: (dataAccessor: UserRoleDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (trx) => {
            const trxDataAccessor = new UserRoleDataAccessorImpl(trx, this.logger);
            return cb(trxDataAccessor);
        })
    }
}

injected(UserRoleDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_ROLE_DATA_ACCESSOR_TOKEN = token<UserRoleDataAccessor>("UserRoleDataAccessor");