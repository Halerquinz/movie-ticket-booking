import { injected, token } from "brandi";
import { Processor, Worker } from "bullmq";
import { Logger } from "winston";
import { LOGGER_TOKEN } from "../../../utils";
import { Redis } from "ioredis";
import { REDIS_INSTANCE_TOKEN } from "../redis";

export interface WorkerHandler {
    topic: string;
    onProcess: Processor<any>;
}

export interface BullWorker {
    registerHandlerListAndStart(handlerList: WorkerHandler[]): Promise<void>;
}

export class WorkerImpl implements BullWorker {
    constructor(
        private readonly logger: Logger,
        private readonly redis: Redis
    ) { }

    public async registerHandlerListAndStart(handlerList: WorkerHandler[]): Promise<void> {
        for (const handler of handlerList) {
            new Worker(handler.topic, handler.onProcess, { connection: this.redis, concurrency: 10 });
        }
    }
}

injected(WorkerImpl, LOGGER_TOKEN, REDIS_INSTANCE_TOKEN);

export const WORKER_TOKEN = token<WorkerImpl>("Worker");
