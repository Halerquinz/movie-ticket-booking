import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import NodeCache from "node-cache";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface Client {
    set(key: string, value: any, ttlInSeconds: number): Promise<void>;
    get(key: string): Promise<any>;
}

export class InMemoryClient implements Client {
    private readonly nodeCache = new NodeCache({ forceString: true });

    constructor(private readonly logger: Logger) { }

    public async set(key: string, value: any, ttlInSeconds: number): Promise<void> {
        if (!this.nodeCache.set(key, value, ttlInSeconds)) {
            this.logger.error("failed to store value into key", { key, value });
            throw new ErrorWithStatus("failed to store value into key", status.INTERNAL);
        }
    }

    public async get(key: string): Promise<any> {
        const value = this.nodeCache.get(key);
        if (value === undefined) {
            this.logger.error("no value found", { key });
            throw new ErrorWithStatus("no value found", status.NOT_FOUND);
        }

        return value;
    }
}

injected(InMemoryClient, LOGGER_TOKEN);

export const CACHE_CLIENT_TOKEN = token<Client>("Client");
