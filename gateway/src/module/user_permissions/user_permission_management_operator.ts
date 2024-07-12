import { injected, token } from "brandi";
import { Logger } from "winston";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { UserServiceClient } from "../../proto/gen/user_service/UserService";
import { ErrorWithHTTPCode, getHttpCodeFromGRPCStatus, LOGGER_TOKEN, promisifyGRPCCall } from "../../utils";
import { UserPermission } from "../schemas";

export interface UserPermissionManagementOperator {
    createUserPermission(permissionName: string, description: string): Promise<UserPermission>;
    getUserPermissionList(): Promise<UserPermission[]>;
    updateUserPermission(id: number, permissionName: string | undefined, description: string | undefined): Promise<UserPermission>;
    deleteUserPermission(id: number): Promise<void>;
    addUserPermissionToUserRole(userRoleId: number, userPermissionId: number): Promise<void>;
    removeUserPermissionFromUserRole(userRoleId: number, userPermissionId: number): Promise<void>;
}

export class UserPermissionManagementOperatorImpl implements UserPermissionManagementOperator {
    constructor(private readonly userServiceDM: UserServiceClient, private readonly logger: Logger) { }

    public async createUserPermission(permissionName: string, description: string): Promise<UserPermission> {
        const { error: createUserPermissionError, response: createUserPermissionResponse } = await promisifyGRPCCall(
            this.userServiceDM.createUserPermission.bind(this.userServiceDM),
            { permissionName, description }
        );
        if (createUserPermissionError !== null) {
            this.logger.error("failed to call user_service.createUserPermission()", {
                error: createUserPermissionError,
            });
            throw new ErrorWithHTTPCode(
                "failed to create new user permission",
                getHttpCodeFromGRPCStatus(createUserPermissionError.code)
            );
        }

        return UserPermission.fromProto(createUserPermissionResponse?.userPermission);
    }

    public async getUserPermissionList(): Promise<UserPermission[]> {
        const { error: getUserPermissionListError, response: getUserPermissionListResponse } = await promisifyGRPCCall(
            this.userServiceDM.getUserPermissionList.bind(this.userServiceDM),
            {}
        );
        if (getUserPermissionListError !== null) {
            this.logger.error("failed to call user_service.getUserPermissionList()", {
                error: getUserPermissionListError,
            });
            throw new ErrorWithHTTPCode(
                "failed to get user permission list",
                getHttpCodeFromGRPCStatus(getUserPermissionListError.code)
            );
        }

        const userPermissionList = getUserPermissionListResponse?.userPermissionList?.map((userPermissionProto) =>
            UserPermission.fromProto(userPermissionProto)
        );
        return userPermissionList || [];
    }

    public async updateUserPermission(
        id: number,
        permissionName: string | undefined,
        description: string | undefined
    ): Promise<UserPermission> {
        const { error: updateUserPermissionError, response: updateUserPermissionResponse } = await promisifyGRPCCall(
            this.userServiceDM.updateUserPermission.bind(this.userServiceDM),
            { userPermission: { id, permissionName, description } }
        );
        if (updateUserPermissionError !== null) {
            this.logger.error("failed to call user_service.updateUserPermission()", {
                error: updateUserPermissionError,
            });
            throw new ErrorWithHTTPCode(
                "failed to update user permission",
                getHttpCodeFromGRPCStatus(updateUserPermissionError.code)
            );
        }

        return UserPermission.fromProto(updateUserPermissionResponse?.userPermission);
    }

    public async deleteUserPermission(id: number): Promise<void> {
        const { error: updateUserPermissionError } = await promisifyGRPCCall(
            this.userServiceDM.deleteUserPermission.bind(this.userServiceDM),
            { id }
        );
        if (updateUserPermissionError !== null) {
            this.logger.error("failed to call user_service.deleteUserPermission()", {
                error: updateUserPermissionError,
            });
            throw new ErrorWithHTTPCode(
                "failed to delete user permission",
                getHttpCodeFromGRPCStatus(updateUserPermissionError.code)
            );
        }
    }

    public async addUserPermissionToUserRole(userRoleId: number, userPermissionId: number): Promise<void> {
        const { error: addUserPermissionToUserRoleError } = await promisifyGRPCCall(
            this.userServiceDM.addUserPermissionToUserRole.bind(this.userServiceDM),
            { userRoleId: userRoleId, userPermissionId: userPermissionId }
        );
        if (addUserPermissionToUserRoleError !== null) {
            this.logger.error("failed to call user_service.addUserPermissionToUserRole()", {
                error: addUserPermissionToUserRoleError,
            });
            throw new ErrorWithHTTPCode(
                "failed to add user permission to user role",
                getHttpCodeFromGRPCStatus(addUserPermissionToUserRoleError.code)
            );
        }
    }

    public async removeUserPermissionFromUserRole(userRoleId: number, userPermissionId: number): Promise<void> {
        const { error: removeUserPermissionFromUserRoleError } = await promisifyGRPCCall(
            this.userServiceDM.removeUserPermissionFromUserRole.bind(this.userServiceDM),
            { userRoleId: userRoleId, userPermissionId: userPermissionId }
        );
        if (removeUserPermissionFromUserRoleError !== null) {
            this.logger.error("failed to call user_service.removeUserPermissionFromUserRole()", {
                error: removeUserPermissionFromUserRoleError,
            });
            throw new ErrorWithHTTPCode(
                "failed to remove user permission from user role",
                getHttpCodeFromGRPCStatus(removeUserPermissionFromUserRoleError.code)
            );
        }
    }
}

injected(UserPermissionManagementOperatorImpl, USER_SERVICE_DM_TOKEN, LOGGER_TOKEN);

export const USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN = token<UserPermissionManagementOperator>(
    "UserPermissionManagementOperator"
);
