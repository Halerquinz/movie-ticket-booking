import { sendUnaryData, status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { USER_MANAGEMENT_OPERATOR_TOKEN, UserManagementOperator } from "../module/user/user_management_operator";
import { _UserListSortOrder_Values } from "../proto/gen/UserListSortOrder";
import { UserServiceHandlers } from "../proto/gen/UserService";
import { ErrorWithStatus } from "../utils/errors";
import { USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN, UserPasswordManagementOperator } from "../module/password";
import { TOKEN_MANAGEMENT_OPERATOR_TOKEN, TokenManagementOperator } from "../module/token";

const DEFAULT_USER_LIST_LIMIT = 10;
const DEFAULT_USER_LIST_OFFSET = 0;
const DEFAULT_USER_SEARCH_LIMIT = 10;
const DEFAULT_USER_LIST_SORT_ORDER = _UserListSortOrder_Values.ID_ASCENDING;

export class UserServiceHandlersFactory {
    constructor(
        private readonly userManagementOperator: UserManagementOperator,
        private readonly userPasswordManagementOperator: UserPasswordManagementOperator,
        private readonly tokenManagementOperator: TokenManagementOperator
    ) { }

    public getUserServiceHandlers(): UserServiceHandlers {
        const handler: UserServiceHandlers = {
            CreateUser: async (call, callback) => {
                const req = call.request;
                if (req.username === undefined) {
                    return callback({
                        message: "username is required",
                        code: status.INVALID_ARGUMENT
                    });
                }
                if (req.displayName === undefined) {
                    return callback({
                        message: "displayName is required",
                        code: status.INVALID_ARGUMENT
                    });
                }

                try {
                    const createdUser = await this.userManagementOperator.createUser(req.username, req.displayName);
                    callback(null, { user: createdUser });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },
            GetUser: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({
                        message: "userId is required",
                        code: status.INVALID_ARGUMENT
                    })
                }

                try {
                    const user = await this.userManagementOperator.getUser(req.id);
                    callback(null, { user });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetUserList: async (call, callback) => {
                const req = call.request;
                if (req.offset === undefined) {
                    req.offset = DEFAULT_USER_LIST_OFFSET;
                }
                if (req.limit === undefined) {
                    req.limit = DEFAULT_USER_LIST_LIMIT;
                }
                if (req.sortOrder === undefined) {
                    req.sortOrder = DEFAULT_USER_LIST_SORT_ORDER;
                }

                try {
                    const { totalUserCount, userList } = await this.userManagementOperator.getUserList(
                        req.offset,
                        req.limit,
                        req.sortOrder,
                        req.filterOptions as any
                    );
                    callback(null, { totalUserCount, userList });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },
            SearchUser: async (call, callback) => {
                const req = call.request;
                if (req.limit === undefined) {
                    req.limit = DEFAULT_USER_SEARCH_LIMIT;
                }
                if (req.query === undefined) {
                    return callback({
                        message: "query is required",
                        code: status.INVALID_ARGUMENT
                    });
                }
                if (req.includedUserIdList === undefined) {
                    req.includedUserIdList = [];
                }

                try {
                    const userList = await this.userManagementOperator.searchUser(req.query, req.limit, req.includedUserIdList);
                    callback(null, { userList });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },
            UpdateUser: async (call, callback) => {
                const req = call.request;
                if (req.user === undefined) {
                    return callback({
                        message: "user is required",
                        code: status.INVALID_ARGUMENT
                    });
                }

                try {
                    const user = await this.userManagementOperator.updateUser(req.user as any);
                    callback(null, { user });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },
            CreateUserPassword: async (call, callback) => {
                const req = call.request;
                if (req.password === undefined) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT
                    })
                }
                if (req.password.ofUserId === undefined) {
                    return callback({
                        message: "password.of_user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.password === undefined) {
                    return callback({
                        message: "password.password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userPasswordManagementOperator.createUserPassword(req.password.ofUserId, req.password.password);
                    return callback(null, {});
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            LoginWithPassword: async (call, callback) => {
                const req = call.request;
                if (req.username === undefined) {
                    return callback({
                        message: "username is required",
                        code: status.INVALID_ARGUMENT
                    })
                }
                if (req.password === undefined) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT
                    })
                }

                try {
                    const { user, token } = await this.userPasswordManagementOperator.loginWithPassword(req.username, req.password);
                    return callback(null, { user, token });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            UpdateUserPassword: async (call, callback) => {
                const req = call.request;
                if (req.password === undefined) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT
                    })
                }
                if (req.password.ofUserId === undefined) {
                    return callback({
                        message: "password.of_user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.password === undefined) {
                    return callback({
                        message: "password.password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userPasswordManagementOperator.updateUserPassword(req.password.ofUserId, req.password.password);
                    return callback(null, {});
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            BlacklistToken: async (call, callback) => {
                const req = call.request;
                if (req.token === undefined) {
                    return callback({
                        message: "token is required",
                        code: status.INVALID_ARGUMENT
                    })
                }
                callback(null, {});

                try {
                    await this.tokenManagementOperator.blacklistToken(req.token);
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetUserFromToken: async (call, callback) => {
                const req = call.request;
                if (req.token === undefined) {
                    return callback({
                        message: "token is required",
                        code: status.INVALID_ARGUMENT
                    })
                }

                try {
                    const { user, newToken } = await this.tokenManagementOperator.getUserFromToken(req.token);
                    return callback(null, { user, newToken: newToken === null ? undefined : newToken });
                } catch (error) {
                    this.handleError(error, callback);
                }
            }
        }
        return handler;
    }

    private handleError(error: unknown, callback: sendUnaryData<any>) {
        if (error instanceof ErrorWithStatus) {
            callback({
                message: error.message,
                code: error.status
            })
        } else if (error instanceof Error) {
            callback({
                message: error.message,
                code: status.INTERNAL
            })
        } else {
            callback({
                code: status.INTERNAL
            })
        }
    }
}

injected(UserServiceHandlersFactory, USER_MANAGEMENT_OPERATOR_TOKEN, USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN, TOKEN_MANAGEMENT_OPERATOR_TOKEN);
export const USER_SERVICE_HANDLERS_FACTORY_TOKEN = token<UserServiceHandlersFactory>("UserServiceHandlersFactory");