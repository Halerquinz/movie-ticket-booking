import { token } from "brandi";

export class RedisConfig {
    public host = "127.0.0.1";
    public port = 6379;
    public url = "127.0.0.1:6379";

    public static fromEnv(): RedisConfig {
        const config = new RedisConfig();
        if (process.env.REDIS_HOST !== undefined) {
            config.host = process.env.REDIS_HOST;
        }
        if (process.env.REDIS_PORT !== undefined) {
            config.port = +process.env.REDIS_PORT;
        }
        config.url = `${config.host}:${config.port}`;
        return config;
    }
}

export const REDIS_CONFIG_TOKEN = token<RedisConfig>("RedisConfig");
