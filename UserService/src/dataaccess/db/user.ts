import { Knex } from "knex";
import { Logger, query } from "winston";
import { ErrorWithStatus } from "../../utils/errors";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { LOGGER_TOKEN } from "../../utils/logging";

export class User {
    constructor(public id: number, public username: string, public displayName: string) { }
}

export enum UserListSortOrder {
    ID_ASCENDING = 0,
    ID_DESCENDING = 1,
    USERNAME_ASCENDING = 2,
    USERNAME_DESCENDING = 3,
    DISPLAY_NAME_ASCENDING = 4,
    DISPLAY_NAME_DESCENDING = 5,
}

export class UserListFilterOptions {
    public shouldFilterByUserIdList = false;
    public userIdList: number[] = [];
    public usernameQuery = "";
}

export interface UserDataAccessor {
    createUser(username: string, displayName: string): Promise<number>;
    updateUser(user: User): Promise<void>;
    getUserByUserId(userId: number): Promise<User | null>;
    getUserByUserIdWithXLock(userId: number): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserByUsernameWithXLock(username: string): Promise<User | null>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder,
        filterOptions: UserListFilterOptions
    ): Promise<User[]>;
    getUserCount(filterOptions: UserListFilterOptions): Promise<number>;
    searchUser(query: string, limit: number, includedUserIdList: number[]): Promise<User[]>;
    withTransaction<T>(cb: (dataAccessor: UserDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameUserServiceUser = "user_service_user_tab";
const ColNameUserServiceUserId = "user_id";
const ColNameUserServiceUserUsername = "username";
const ColNameUserServiceUserDisplayName = "display_name";
const ColNameUserServiceUserFullTextSearchDocument = "full_text_search_document";

export default class UserDataAccessorImpl implements UserDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) { }

    public async createUser(username: string, displayName: string): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameUserServiceUserUsername]: username,
                    [ColNameUserServiceUserDisplayName]: displayName
                })
                .returning(ColNameUserServiceUserId)
                .into(TabNameUserServiceUser);
            return +rows[0][ColNameUserServiceUserId];
        } catch (error) {
            this.logger.error("create user failed", {
                username,
                displayName,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUser(user: User): Promise<void> {
        try {
            const row = await this.knex
                .table(TabNameUserServiceUser)
                .update({
                    [ColNameUserServiceUserUsername]: user.username,
                    [ColNameUserServiceUserDisplayName]: user.displayName
                })
                .where(ColNameUserServiceUserId, user.id);
        } catch (error) {
            this.logger.error("failed to update user profile", {
                user
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserByUserId(userId: number): Promise<User | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserId]: userId
                });
        } catch (error) {
            this.logger.error("failed to get user by userId", {
                userId
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found user with userId", { userId });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with userId", { userId });
            throw ErrorWithStatus.wrapWithStatus("more than one user with userId", status.INTERNAL);
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserByUserIdWithXLock(userId: number): Promise<User | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserId]: userId
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user by userId", {
                userId
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found user with userId", { userId });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with userId", { userId });
            throw ErrorWithStatus.wrapWithStatus("more than one user with userId", status.INTERNAL);
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserByUsername(username: string): Promise<User | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserUsername]: username
                });
        } catch (error) {
            this.logger.error("failed to get user by username", {
                username
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with username found", { username });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with username", { username });
            throw ErrorWithStatus.wrapWithStatus("more than one user with username", status.INTERNAL);
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserByUsernameWithXLock(username: string): Promise<User | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserUsername]: username
                })
                .forUpdate();

        } catch (error) {
            this.logger.error("failed to get user by username", {
                username
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with username found", { username });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with username", { username });
            throw ErrorWithStatus.wrapWithStatus("more than one user with username", status.INTERNAL);
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder,
        filterOptions: UserListFilterOptions
    ): Promise<User[]> {
        try {
            let queryBuilder = this.knex
                .select(`${TabNameUserServiceUser}.${ColNameUserServiceUserId},
                ${TabNameUserServiceUser}.${ColNameUserServiceUserUsername},
                ${TabNameUserServiceUser}.${ColNameUserServiceUserDisplayName}
                `)
                .offset(offset)
                .limit(limit);
            queryBuilder = this.applyUserListOrderByClause(queryBuilder, sortOrder);
            queryBuilder = queryBuilder.where((qb) => this.getUserListFilterOptionsWhereClause(qb, filterOptions));
            const rows = await queryBuilder;
            return rows.map((row: Record<string, any>) => this.getUserFromRow(row));
        } catch (error) {
            this.logger.error("get user list failed", {
                offset,
                limit,
                sortOrder,
                filterOptions,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserCount(filterOptions: UserListFilterOptions): Promise<number> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .count()
                .from(TabNameUserServiceUser)
                .where((qb) => this.getUserListFilterOptionsWhereClause(qb, filterOptions));
        } catch (error) {
            this.logger.error("get user count failed", {
                filterOptions,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        return +rows[0]["count"];
    }

    public async searchUser(query: string, limit: number, includedUserIdList: number[]): Promise<User[]> {
        let queryBuilder = this.knex
            .select()
            .from(TabNameUserServiceUser)
            .whereRaw(`${ColNameUserServiceUserFullTextSearchDocument} @@ plainto_tsquery (?)`, query)
            .orderByRaw(`ts-rank(${ColNameUserServiceUserFullTextSearchDocument}, plainto_tsquery (?)) DESC`, query)
            .limit(limit);
        try {
            const rows = await queryBuilder;
            return rows.map((row: Record<string, any>) => this.getUserFromRow(row));
        } catch (error) {
            this.logger.error("get user list failed", {
                query,
                limit,
                includedUserIdList,
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: UserDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (trx) => {
            const trxDataAccessor = new UserDataAccessorImpl(trx, this.logger);
            return cb(trxDataAccessor);
        });
    }

    private applyUserListOrderByClause(qb: Knex.QueryBuilder, sortOptions: UserListSortOrder): Knex.QueryBuilder {
        switch (sortOptions) {
            case UserListSortOrder.ID_ASCENDING:
                return qb.orderBy(ColNameUserServiceUserId, "asc");
            case UserListSortOrder.ID_DESCENDING:
                return qb.orderBy(ColNameUserServiceUserId, "desc");
            case UserListSortOrder.USERNAME_ASCENDING:
                return qb.orderBy(ColNameUserServiceUserUsername, "asc").orderBy(ColNameUserServiceUserId, "asc");
            case UserListSortOrder.USERNAME_DESCENDING:
                return qb.orderBy(ColNameUserServiceUserUsername, "desc").orderBy(ColNameUserServiceUserId, "desc");
            case UserListSortOrder.DISPLAY_NAME_ASCENDING:
                return qb.orderBy(ColNameUserServiceUserDisplayName, "asc").orderBy(ColNameUserServiceUserId, "asc");
            case UserListSortOrder.DISPLAY_NAME_DESCENDING:
                return qb.orderBy(ColNameUserServiceUserDisplayName, "desc").orderBy(ColNameUserServiceUserId, "desc");
            default:
                throw ErrorWithStatus.wrapWithStatus("invalid user list sort order", status.INTERNAL);
        }
    }

    private getUserListFilterOptionsWhereClause(qb: Knex.QueryBuilder, filterOptions: UserListFilterOptions): Knex.QueryBuilder {
        if (filterOptions.shouldFilterByUserIdList) {
            qb.whereIn(`${ColNameUserServiceUserId}`, filterOptions.userIdList);
        }
        if (filterOptions.usernameQuery !== "") {
            qb.whereRaw(`${ColNameUserServiceUserFullTextSearchDocument} @@ plainto_tsquery (?)`, filterOptions.usernameQuery);
        }
        return qb;
    }

    private getUserFromRow(row: Record<string, any>): User {
        return new User(
            +row[ColNameUserServiceUserId],
            row[ColNameUserServiceUserUsername],
            row[ColNameUserServiceUserDisplayName]
        );
    }
}

injected(UserDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_DATA_ACCESSOR_TOKEN = token<UserDataAccessor>("UserDataAccessor");