import NodeCache from "node-cache";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";

export interface CacheClient {
    set(key: string, value: string, ttlInSecond: number): Promise<void>;
    get(key: string): Promise<any>;
}

export class InMemoryClient implements CacheClient {
    private readonly nodeCache = new NodeCache({ forceString: true });

    constructor(private readonly logger: Logger) { }

    public async get(key: string): Promise<any> {
        const value = this.nodeCache.get(key);
        if (!value) {
            this.logger.error("no value found", { key, value });
            throw new ErrorWithStatus("no value found", status.INTERNAL);
        }

        return value;
    }

    public async set(key: string, value: string, ttlInSecond: number): Promise<void> {
        if (!this.nodeCache.set(key, value, ttlInSecond)) {
            this.logger.error("failed to store value into key", { key });
            throw new ErrorWithStatus("failed to store value into key", status.INTERNAL);
        }
    }
}

injected(InMemoryClient, LOGGER_TOKEN);

export const CACHE_CLIENT_TOKEN = token<InMemoryClient>("CacheClient");