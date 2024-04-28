import Redis from "ioredis";
import { REDIS_CONFIG_TOKEN, RedisConfig } from "../../config";
import { injected, token } from "brandi";

export function newRedisInstance(redisConfig: RedisConfig): Redis {
    return new Redis({
        port: redisConfig.port,
        host: redisConfig.host,
        maxRetriesPerRequest: null
    });
}

injected(newRedisInstance, REDIS_CONFIG_TOKEN);

export const REDIS_INSTANCE_TOKEN = token<Redis>("Redis");