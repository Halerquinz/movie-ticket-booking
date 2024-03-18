import { Logger } from "winston";
import { UserServiceClient } from "../../proto/gen/UserService";
import { promisifyGRPCCall, ErrorWithHTTPCode, getHttpCodeFromGRPCStatus, LOGGER_TOKEN } from "../../utils";
import { User } from "../schemas";
import { injected, token } from "brandi";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";

export interface SessionManagementOperator {
    loginWithPassword(username: string, password: string): Promise<{ user: User, token: string }>;
    logout(token: string): Promise<void>;
    getUserOfSession(token: string): Promise<{ user: User, newToken: string | null }>
}

export class SessionManagementOperatorImpl implements SessionManagementOperator {
    constructor(
        private readonly userServiceDM: UserServiceClient,
        private readonly logger: Logger
    ) { }

    public async loginWithPassword(username: string, password: string): Promise<{ user: User; token: string; }> {
        const { error: loginWithPasswordError, response: loginWithPasswordResponse } = await promisifyGRPCCall(
            this.userServiceDM.loginWithPassword.bind(this.userServiceDM),
            { username, password }
        );

        if (loginWithPasswordError !== null) {
            this.logger.error("failed to call user_service.loginWithPassword()", { error: loginWithPasswordError });
            throw new ErrorWithHTTPCode(
                "failed to log in with password",
                getHttpCodeFromGRPCStatus(loginWithPasswordError.code)
            );
        }

        const user = User.fromProto(loginWithPasswordResponse?.user);
        const token = loginWithPasswordResponse?.token || "";

        return { user, token };
    }

    public async logout(token: string): Promise<void> {
        const { error: blacklistTokenError } = await promisifyGRPCCall(
            this.userServiceDM.blacklistToken.bind(this.userServiceDM), { token });

        if (blacklistTokenError !== null) {
            this.logger.error("failed to call user_service.blacklistToken()", {
                error: blacklistTokenError,
            });
            throw new ErrorWithHTTPCode("failed to log out", getHttpCodeFromGRPCStatus(blacklistTokenError.code));
        }
    }

    public async getUserOfSession(token: string): Promise<{ user: User; newToken: string | null; }> {
        const { error: getUserFromTokenError, response: getUserFromTokenResponse } = await promisifyGRPCCall(
            this.userServiceDM.getUserFromToken.bind(this.userServiceDM), { token });

        if (getUserFromTokenError !== null) {
            this.logger.error("failed to call user_service.getUserFromToken()", {
                error: getUserFromTokenError,
            });
            throw new ErrorWithHTTPCode("failed to get user from session", getHttpCodeFromGRPCStatus(getUserFromTokenError.code));
        }

        const user = User.fromProto(getUserFromTokenResponse?.user);
        const newToken = getUserFromTokenResponse?.newToken === undefined ? null : getUserFromTokenResponse.newToken

        return { user, newToken }
    }
}

injected(SessionManagementOperatorImpl, USER_SERVICE_DM_TOKEN, LOGGER_TOKEN);

export const SESSION_MANAGEMENT_OPERATOR_TOKEN = token<SessionManagementOperator>("SessionManagementOperator");