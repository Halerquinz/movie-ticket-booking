import { Logger } from "winston";
import { UserServiceClient } from "../../proto/gen/UserService";
import { promisifyGRPCCall, ErrorWithHTTPCode, getHttpCodeFromGRPCStatus, LOGGER_TOKEN } from "../../utils";
import { User, UserPermission, UserRole } from "../schemas";
import { injected, token } from "brandi";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";

export interface SessionManagementOperator {
    loginWithPassword(username: string, password: string): Promise<{
        user: User,
        token: string,
        userRoleList: UserRole[],
        userPermissionList: UserPermission[];
    }>;
    logout(token: string): Promise<void>;
    getUserOfSession(token: string): Promise<{
        user: User,
        newToken: string | null,
        userRoleList: UserRole[];
        userPermissionList: UserPermission[];
    }>;
}

export class SessionManagementOperatorImpl implements SessionManagementOperator {
    constructor(
        private readonly userServiceDM: UserServiceClient,
        private readonly logger: Logger
    ) { }

    public async loginWithPassword(username: string, password: string): Promise<{
        user: User;
        token: string;
        userRoleList: UserRole[];
        userPermissionList: UserPermission[];
    }> {
        const { error: loginWithPasswordError, response: loginWithPasswordResponse } = await promisifyGRPCCall(
            this.userServiceDM.loginWithPassword.bind(this.userServiceDM),
            { username, password }
        );

        if (loginWithPasswordError !== null) {
            this.logger.error("failed to call user_service.loginWithPassword()", { error: loginWithPasswordError });
            throw new ErrorWithHTTPCode("failed to log in with password", getHttpCodeFromGRPCStatus(loginWithPasswordError.code));
        }

        const user = User.fromProto(loginWithPasswordResponse?.user);
        const token = loginWithPasswordResponse?.token || "";
        const userRoleList = await this.getUserRoleListOfUser(user.id);
        const userPermissionList = await this.getUserPermissionListOfUser(user.id);

        return { user, token, userRoleList, userPermissionList };
    }

    public async logout(token: string): Promise<void> {
        const { error: blacklistTokenError } = await promisifyGRPCCall(
            this.userServiceDM.blacklistToken.bind(this.userServiceDM), { token });

        if (blacklistTokenError !== null) {
            this.logger.error("failed to call user_service.blacklistToken()", { error: blacklistTokenError });
            throw new ErrorWithHTTPCode("failed to log out", getHttpCodeFromGRPCStatus(blacklistTokenError.code));
        }
    }

    public async getUserOfSession(token: string): Promise<{
        user: User;
        newToken: string | null;
        userRoleList: UserRole[];
        userPermissionList: UserPermission[];
    }> {
        const { error: getUserFromTokenError, response: getUserFromTokenResponse } = await promisifyGRPCCall(
            this.userServiceDM.getUserFromToken.bind(this.userServiceDM), { token });

        if (getUserFromTokenError !== null) {
            this.logger.error("failed to call user_service.getUserFromToken()", { error: getUserFromTokenError });
            throw new ErrorWithHTTPCode("failed to get user from session", getHttpCodeFromGRPCStatus(getUserFromTokenError.code));
        }

        const user = User.fromProto(getUserFromTokenResponse?.user);
        const newToken = getUserFromTokenResponse?.newToken === undefined ? null : getUserFromTokenResponse.newToken;
        const userRoleList = await this.getUserRoleListOfUser(user.id);
        const userPermissionList = await this.getUserPermissionListOfUser(user.id);

        return { user, newToken, userRoleList, userPermissionList };
    }

    private async getUserRoleListOfUser(userId: number): Promise<UserRole[]> {
        const { error: getUserRoleListOfUserListError, response: getUserRoleListOfUserListResponse } =
            await promisifyGRPCCall(this.userServiceDM.getUserRoleListOfUserList.bind(this.userServiceDM), {
                userIdList: [userId],
            });
        if (getUserRoleListOfUserListError !== null) {
            this.logger.error("failed to call user_service.getUserRoleListOfUserList()", {
                error: getUserRoleListOfUserListError,
            });
            throw new ErrorWithHTTPCode(
                "failed to log in with password",
                getHttpCodeFromGRPCStatus(getUserRoleListOfUserListError.code)
            );
        }

        if (getUserRoleListOfUserListResponse?.userRoleListOfUserList === undefined) {
            return [];
        }

        return (
            getUserRoleListOfUserListResponse.userRoleListOfUserList[0].userRoleList?.map((userRoleProto) =>
                UserRole.fromProto(userRoleProto)
            ) || []
        );
    }

    private async getUserPermissionListOfUser(userId: number): Promise<UserPermission[]> {
        const { error: getUserPermissionListOfUserError, response: getUserPermissionListOfUserResponse } =
            await promisifyGRPCCall(this.userServiceDM.getUserPermissionListOfUser.bind(this.userServiceDM), {
                userId: userId,
            });
        if (getUserPermissionListOfUserError !== null) {
            this.logger.error("failed to call user_service.getUserPermissionListOfUser()", {
                error: getUserPermissionListOfUserError,
            });
            throw new ErrorWithHTTPCode(
                "failed to log in with password",
                getHttpCodeFromGRPCStatus(getUserPermissionListOfUserError.code)
            );
        }

        return (
            getUserPermissionListOfUserResponse?.userPermissionList?.map((userPermissionProto) =>
                UserPermission.fromProto(userPermissionProto)
            ) || []
        );
    }
}

injected(SessionManagementOperatorImpl, USER_SERVICE_DM_TOKEN, LOGGER_TOKEN);

export const SESSION_MANAGEMENT_OPERATOR_TOKEN = token<SessionManagementOperator>("SessionManagementOperator");