import { token } from "brandi";

export class CacheConfig {
    public userCacheTtlInSeconds = 900; // 15 minutes

    public static fromEnv(): CacheConfig {
        const config = new CacheConfig();
        if (process.env.USER_CACHE_TTL_IN_SECONDS !== undefined) {
            config.userCacheTtlInSeconds = +process.env.USER_CACHE_TTL_IN_SECONDS;
        }
        return config;
    }
}

export const CACHE_CONFIG_TOKEN = token<CacheConfig>("CacheConfig");
