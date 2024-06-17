import { token } from "brandi";

export class CacheConfig {
    public address = "127.0.0.1:6379";
    public host = "127.0.0.1";
    public port = 6379;
    public username = "";
    public password = "";

    public static fromEnv(): CacheConfig {
        const config = new CacheConfig();
        if (process.env.CACHE_ADDRESS !== undefined) {
            config.address = process.env.CACHE_ADDRESS;
        }
        if (process.env.CACHE_HOST !== undefined) {
            config.host = process.env.CACHE_HOST;
        }
        if (process.env.CACHE_PORT !== undefined) {
            config.port = +process.env.CACHE_PORT;
        }
        if (process.env.CACHE_USERNAME !== undefined) {
            config.username = process.env.CACHE_USERNAME;
        }
        if (process.env.CACHE_PASSWORD !== undefined) {
            config.password = process.env.CACHE_PASSWORD;
        }
        return config;
    }
}

export const CACHE_CONFIG_TOKEN = token<CacheConfig>("CacheConfig");
