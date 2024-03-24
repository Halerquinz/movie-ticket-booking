import { Logger } from "winston";
import { UserServiceClient } from "../../proto/gen/UserService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall } from "../../utils";
import { User } from "../schemas";
import { injected, token } from "brandi";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";

export interface UserManagementOperator {
    createUser(username: string, displayName: string, password: string): Promise<User>;
    updateUser(
        id: number,
        username: string | undefined,
        displayName: string | undefined,
        password: string | undefined
    ): Promise<User>;
}

export class UserManagementOperatorImpl implements UserManagementOperator {

    constructor(
        private readonly userServiceDM: UserServiceClient,
        private readonly logger: Logger
    ) { }

    public async createUser(username: string, displayName: string, password: string): Promise<User> {
        const { error: createUserError, response: createUserResponse } = await promisifyGRPCCall(
            this.userServiceDM.createUser.bind(this.userServiceDM),
            { username, displayName }
        );

        if (createUserError !== null) {
            this.logger.error("failed to call user_service.createUser()", { error: createUserError });
            throw new ErrorWithHTTPCode("failed to create new user", getHttpCodeFromGRPCStatus(createUserError.code));
        }

        const user = User.fromProto(createUserResponse?.user);
        const { error: createUserPasswordError } = await promisifyGRPCCall(
            this.userServiceDM.createUserPassword.bind(this.userServiceDM),
            {
                password: {
                    ofUserId: user.id,
                    password: password,
                },
            }
        );

        if (createUserPasswordError !== null) {
            this.logger.error("failed to call user_service.createUserPassword()", { error: createUserError });
            throw new ErrorWithHTTPCode("failed to create new user's password", getHttpCodeFromGRPCStatus(createUserPasswordError.code));
        }

        return user;
    }

    public async updateUser(id: number, username: string | undefined, displayName: string | undefined, password: string | undefined): Promise<User> {
        const { error: updateUserError, response: updateUserResponse } = await promisifyGRPCCall(
            this.userServiceDM.updateUser.bind(this.userServiceDM),
            { user: { id, username, displayName, password } }
        );
        if (updateUserError !== null) {
            this.logger.error("failed to call user_service.updateUser()", { error: updateUserError });
            throw new ErrorWithHTTPCode("failed to update user's info", getHttpCodeFromGRPCStatus(updateUserError.code));
        }

        if (password !== undefined) {
            const { error: updateUserPasswordError } = await promisifyGRPCCall(
                this.userServiceDM.updateUserPassword.bind(this.userServiceDM),
                { password: { ofUserId: id, password: password } }
            );
            if (updateUserPasswordError !== null) {
                this.logger.error("failed to call user_service.updateUserPassword()", { error: updateUserPasswordError });
                throw new ErrorWithHTTPCode("failed to update user's information", getHttpCodeFromGRPCStatus(updateUserPasswordError.code));
            }
        }

        const user = User.fromProto(updateUserResponse?.user);
        return user;
    }
}

injected(UserManagementOperatorImpl, USER_SERVICE_DM_TOKEN, LOGGER_TOKEN);

export const USER_MANAGEMENT_OPERATOR_TOKEN = token<UserManagementOperator>("UserManagementOperator");