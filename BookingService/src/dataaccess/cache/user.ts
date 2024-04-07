import { injected, token } from "brandi";
import { CacheConfig, CACHE_CONFIG_TOKEN } from "../../config";
import { User } from "../../proto/gen/User";
import { CACHE_CLIENT_TOKEN, Client } from "./client";

export interface UserCacheDM {
    set(userId: number, user: User): Promise<void>;
    get(userId: number): Promise<User>;
}

export class UserCacheDMImpl implements UserCacheDM {
    constructor(private readonly client: Client, private readonly cacheConfig: CacheConfig) {}

    public async set(userId: number, user: User): Promise<void> {
        return this.client.set(this.getKey(userId), user, this.cacheConfig.userCacheTtlInSeconds);
    }

    public async get(userId: number): Promise<User> {
        return (await this.client.get(this.getKey(userId))) as User;
    }

    private getKey(userId: number): string {
        return `user|user_id:${userId}`;
    }
}

injected(UserCacheDMImpl, CACHE_CLIENT_TOKEN, CACHE_CONFIG_TOKEN);

export const USER_CACHE_DM_TOKEN = token<UserCacheDM>("UserCacheDM");
