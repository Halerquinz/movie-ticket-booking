import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { CACHE_CONFIG_TOKEN, CacheConfig } from "../../config";
import { Redis } from "ioredis";

export interface CacheClient {
    set(key: string, value: string, ttlInSecond: number): Promise<void>;
    get(key: string): Promise<any>;
}

export class InMemoryClient implements CacheClient {
    private readonly redisClient: Redis;

    constructor(
        private readonly logger: Logger,
        private readonly cacheConfig: CacheConfig
    ) {
        this.redisClient = new Redis({
            host: this.cacheConfig.host,
            port: this.cacheConfig.port,
            username: this.cacheConfig.username,
            password: this.cacheConfig.password,
        });
    }

    public async get(key: string): Promise<any> {
        const value = await this.redisClient.get(key);
        if (value === null) {
            this.logger.error("no value found", { key, value });
            throw new ErrorWithStatus("no value found", status.INTERNAL);
        }

        return value;
    }

    public async set(key: string, value: string, ttlInSecond: number): Promise<void> {
        try {
            await this.redisClient.set(key, value);
        } catch (error) {
            console.log(error);
            this.logger.error("failed to store value into key", { key, error });
            throw new ErrorWithStatus("failed to store value into key", status.INTERNAL);
        }
    }
}

injected(InMemoryClient, LOGGER_TOKEN, CACHE_CONFIG_TOKEN);

export const CACHE_CLIENT_TOKEN = token<InMemoryClient>("CacheClient");