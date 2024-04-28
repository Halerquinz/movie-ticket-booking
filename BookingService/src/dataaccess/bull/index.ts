import { Container } from "brandi";
import { REDIS_INSTANCE_TOKEN, newRedisInstance } from "./redis";
import * as worker from "./worker";
import * as jobQueue from "./jobqueue";

export * from "./redis";
export * from "./jobqueue";
export * from "./worker";

export function bindToContainer(container: Container): void {
    jobQueue.bindToContainer(container);
    worker.bindToContainer(container);
    container
        .bind(REDIS_INSTANCE_TOKEN)
        .toInstance(newRedisInstance).inSingletonScope();
}