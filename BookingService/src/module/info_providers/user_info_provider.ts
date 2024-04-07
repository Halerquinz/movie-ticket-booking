import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Logger } from "winston";
import { UserCacheDM, USER_CACHE_DM_TOKEN } from "../../dataaccess/cache";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { User } from "../../proto/gen/User";
import { UserServiceClient } from "../../proto/gen/UserService";
import { promisifyGRPCCall, LOGGER_TOKEN } from "../../utils";

export interface UserInfoProvider {
    getUser(userId: number): Promise<User | null>;
}

export class UserInfoProviderImpl implements UserInfoProvider {
    constructor(
        private readonly userServiceDM: UserServiceClient,
        private readonly userCacheDM: UserCacheDM,
        private readonly logger: Logger
    ) { }

    public async getUser(userId: number): Promise<User | null> {
        try {
            return await this.userCacheDM.get(userId);
        } catch (error) {
            this.logger.warn("failed to get user from cache, will fail back to user service", { userId });
        }

        const user = await this.getUserFromUserService(userId);
        if (user === null) {
            return null;
        }

        try {
            await this.userCacheDM.set(userId, user);
        } catch (error) {
            this.logger.warn("failed to set user into cache, will skip", { userId });
        }

        return user;
    }

    private async getUserFromUserService(userId: number): Promise<User | null> {
        const { error: getUserError, response: getUserResponse } = await promisifyGRPCCall(
            this.userServiceDM.getUser.bind(this.userServiceDM),
            { id: userId }
        );
        if (getUserError !== null) {
            if (getUserError.code === status.NOT_FOUND) {
                return null;
            }
            this.logger.error("failed to call user_service.getUser()", {
                error: getUserError,
            });
            throw new Error("Failed to get user");
        }

        if (getUserResponse?.user === undefined) {
            this.logger.error("invalid user_service.getUser() response", {
                userId,
            });
            throw new Error("Failed to get user");
        }
        return getUserResponse?.user;
    }
}

injected(UserInfoProviderImpl, USER_SERVICE_DM_TOKEN, USER_CACHE_DM_TOKEN, LOGGER_TOKEN);

export const USER_INFO_PROVIDER_TOKEN = token<UserInfoProvider>("UserInfoProvider");
