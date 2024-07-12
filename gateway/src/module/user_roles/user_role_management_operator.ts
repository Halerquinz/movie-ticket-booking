import { injected, token } from "brandi";
import { Logger } from "winston";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { UserServiceClient } from "../../proto/gen/user_service/UserService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall } from "../../utils";
import { UserRole } from "../schemas";

export interface UserRoleManagementOperator {
    createUserRole(displayName: string, description: string): Promise<UserRole>;
    updateUserRole(id: number, displayName: string | undefined, description: string | undefined): Promise<UserRole>;
    deleteUserRole(id: number): Promise<void>;
    addUserRoleToUser(userId: number, userRoleId: number): Promise<void>;
    removeUserRoleFromUser(userId: number, userRoleId: number): Promise<void>;
}

export class UserRoleManagementOperatorImpl implements UserRoleManagementOperator {
    constructor(private readonly userServiceDM: UserServiceClient, private readonly logger: Logger) { }

    public async createUserRole(displayName: string, description: string): Promise<UserRole> {
        const { error: createUserRoleError, response: createUserRoleResponse } = await promisifyGRPCCall(
            this.userServiceDM.createUserRole.bind(this.userServiceDM),
            { displayName, description }
        );
        if (createUserRoleError !== null) {
            this.logger.error("failed to call user_service.createUserRole()", { error: createUserRoleError });
            throw new ErrorWithHTTPCode(
                "failed to create new user role",
                getHttpCodeFromGRPCStatus(createUserRoleError.code)
            );
        }

        return UserRole.fromProto(createUserRoleResponse?.userRole);
    }

    public async updateUserRole(id: number, displayName: string | undefined, description: string | undefined): Promise<UserRole> {
        const { error: updateUserRoleError, response: updateUserRoleResponse } = await promisifyGRPCCall(
            this.userServiceDM.updateUserRole.bind(this.userServiceDM),
            {
                userRole: { id, displayName, description },
            }
        );
        if (updateUserRoleError !== null) {
            this.logger.error("failed to call user_service.updateUserRole()", { error: updateUserRoleError });
            throw new ErrorWithHTTPCode(
                "failed to update user role",
                getHttpCodeFromGRPCStatus(updateUserRoleError.code)
            );
        }

        return UserRole.fromProto(updateUserRoleResponse?.userRole);
    }

    public async deleteUserRole(id: number): Promise<void> {
        const { error: deleteUserRoleError } = await promisifyGRPCCall(
            this.userServiceDM.deleteUserRole.bind(this.userServiceDM),
            { id }
        );
        if (deleteUserRoleError !== null) {
            this.logger.error("failed to call user_service.deleteUserRole()", { error: deleteUserRoleError });
            throw new ErrorWithHTTPCode(
                "failed to delete user role",
                getHttpCodeFromGRPCStatus(deleteUserRoleError.code)
            );
        }
    }

    public async addUserRoleToUser(userId: number, userRoleId: number): Promise<void> {
        const { error: addUserRoleToUserError } = await promisifyGRPCCall(
            this.userServiceDM.addUserRoleToUser.bind(this.userServiceDM),
            { userId: userId, userRoleId: userRoleId }
        );
        if (addUserRoleToUserError !== null) {
            this.logger.error("failed to call user_service.addUserRoleToUser()", { error: addUserRoleToUserError });
            throw new ErrorWithHTTPCode(
                "failed to add user role to user",
                getHttpCodeFromGRPCStatus(addUserRoleToUserError.code)
            );
        }
    }

    public async removeUserRoleFromUser(userId: number, userRoleId: number): Promise<void> {
        const { error: removeUserRoleFromUserError } = await promisifyGRPCCall(
            this.userServiceDM.removeUserRoleFromUser.bind(this.userServiceDM),
            { userId: userId, userRoleId: userRoleId }
        );
        if (removeUserRoleFromUserError !== null) {
            this.logger.error("failed to call user_service.removeUserRoleFromUser()", {
                error: removeUserRoleFromUserError,
            });
            throw new ErrorWithHTTPCode(
                "failed to remove user role from user",
                getHttpCodeFromGRPCStatus(removeUserRoleFromUserError.code)
            );
        }
    }
}

injected(UserRoleManagementOperatorImpl, USER_SERVICE_DM_TOKEN, LOGGER_TOKEN);

export const USER_ROLE_MANAGEMENT_OPERATOR_TOKEN = token<UserRoleManagementOperator>("UserRoleManagementOperator");
