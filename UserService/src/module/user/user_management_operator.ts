import { Logger } from "winston";
import { USER_DATA_ACCESSOR_TOKEN, User, UserDataAccessor, UserListFilterOptions, UserListSortOrder } from "../../dataaccess/db/user";
import { _UserListSortOrder_Values } from "../../proto/gen/UserListSortOrder";
import validator from "validator";
import { ErrorWithStatus } from "../../utils/errors";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { LOGGER_TOKEN } from "../../utils/logging";

export interface UserManagementOperator {
    createUser(username: string, displayName: string): Promise<User>;
    updateUser(user: User): Promise<User>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values,
        filterOptions: UserListFilterOptions | undefined
    ): Promise<{ totalUserCount: number; userList: User[] }>;
    getUser(userId: number): Promise<User>;
    searchUser(query: string, limit: number, includedUserIdList: number[]): Promise<User[]>;
}

export class UserManagementOperatorImpl implements UserManagementOperator {
    constructor(
        private readonly userDM: UserDataAccessor,
        private readonly logger: Logger
    ) { }

    public async createUser(username: string, displayName: string): Promise<User> {
        if (!this.isValidUsername(username)) {
            this.logger.error("invalid username", { username });
            throw new ErrorWithStatus(`invalid username ${username}`, status.INVALID_ARGUMENT);
        }

        displayName = this.sanitizeDisplayName(displayName);
        if (!this.isValidDisplayName(displayName)) {
            this.logger.error("invalid displayname", { username });
            throw new ErrorWithStatus(`invalid displayname ${username}`, status.INVALID_ARGUMENT);
        }

        return this.userDM.withTransaction<User>(async (dm) => {
            const userRecord = await dm.getUserByUsernameWithXLock(username);
            if (userRecord !== null) {
                this.logger.error("username has already been taken", {
                    username,
                });
                throw new ErrorWithStatus(`username ${username} has already been taken`, status.ALREADY_EXISTS);
            }

            const createUserId = await dm.createUser(username, displayName);
            return {
                id: createUserId,
                username,
                displayName
            }
        })
    }

    public async updateUser(user: User): Promise<User> {
        if (user.id === undefined) {
            this.logger.error("userId is requirement");
            throw new ErrorWithStatus(`userId is requirement`, status.INVALID_ARGUMENT);
        }

        if (user.username !== undefined) {
            if (!this.isValidUsername(user.username)) {
                this.logger.error("invalid username");
                throw new ErrorWithStatus(`invalid username`, status.INVALID_ARGUMENT);
            }
        }

        if (user.displayName !== undefined) {
            if (!this.isValidDisplayName(user.displayName)) {
                this.logger.error("invalid displayName");
                throw new ErrorWithStatus(`invalid displayName`, status.INVALID_ARGUMENT);
            }
        }

        return this.userDM.withTransaction<User>(async (dm) => {
            const userRecord = await this.userDM.getUserByUserIdWithXLock(user.id);
            if (userRecord === null) {
                this.logger.error("can not find user with userId");
                throw new ErrorWithStatus(`can not find user with userId`, status.INVALID_ARGUMENT);
            }

            if (user.username !== undefined) {
                const userWithUsernameRecord = await this.userDM.getUserByUsernameWithXLock(user.username);
                if (userWithUsernameRecord !== null) {
                    this.logger.error("username already exist");
                    throw new ErrorWithStatus(`username already exist`, status.ALREADY_EXISTS);
                }

                userRecord.username = user.username;
            }

            await this.userDM.updateUser(user);

            if (user.displayName !== undefined) {
                userRecord.displayName = user.displayName;
            }

            return userRecord;
        })
    }

    public async getUser(userId: number): Promise<User> {
        const user = await this.userDM.getUserByUserId(userId);
        if (user === null) {
            this.logger.error("can not find user with userId");
            throw new ErrorWithStatus(`can not find user with userId`, status.INVALID_ARGUMENT);
        }

        return user;
    }

    public async getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values,
        filterOptions: UserListFilterOptions | undefined
    ): Promise<{ totalUserCount: number; userList: User[]; }> {
        const dmSortOrder = this.getUserListSortOrder(sortOrder);
        const dmResults = await Promise.all([
            this.userDM.getUserCount(filterOptions!),
            this.userDM.getUserList(offset, limit, dmSortOrder, filterOptions!)
        ]);
        return {
            totalUserCount: dmResults[0],
            userList: dmResults[1],
        };
    }

    public async searchUser(query: string, limit: number, includedUserIdList: number[]): Promise<User[]> {
        if (query == "") {
            return [];
        }
        return await this.userDM.searchUser(query, limit, includedUserIdList);
    }

    private getUserListSortOrder(sortOrder: _UserListSortOrder_Values): UserListSortOrder {
        switch (sortOrder) {
            case _UserListSortOrder_Values.ID_ASCENDING:
                return UserListSortOrder.ID_ASCENDING;
            case _UserListSortOrder_Values.ID_DESCENDING:
                return UserListSortOrder.ID_DESCENDING;
            case _UserListSortOrder_Values.USERNAME_ASCENDING:
                return UserListSortOrder.USERNAME_ASCENDING;
            case _UserListSortOrder_Values.USERNAME_DESCENDING:
                return UserListSortOrder.USERNAME_DESCENDING;
            case _UserListSortOrder_Values.DISPLAY_NAME_ASCENDING:
                return UserListSortOrder.DISPLAY_NAME_ASCENDING;
            case _UserListSortOrder_Values.DISPLAY_NAME_DESCENDING:
                return UserListSortOrder.DISPLAY_NAME_DESCENDING;
            default:
                this.logger.error("invalid sort_order value", { sortOrder });
                throw new ErrorWithStatus(`invalid sort_order value ${sortOrder}`, status.INVALID_ARGUMENT);
        }
    }

    private sanitizeDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }

    private isValidUsername(username: string): boolean {
        return validator.isLength(username, { min: 6, max: 64 }) && validator.isAlphanumeric(username);
    }

    private isValidDisplayName(displayName: string): boolean {
        return validator.isLength(displayName, { min: 1, max: 256 });
    }
}

injected(UserManagementOperatorImpl, USER_DATA_ACCESSOR_TOKEN, LOGGER_TOKEN);

export const USER_MANAGEMENT_OPERATOR_TOKEN = token<UserManagementOperator>("UserManagementOperator");