import { Container } from "brandi";
import { WORKER_TOKEN, WorkerImpl } from "./worker";

export * from "./worker";

export function bindToContainer(container: Container): void {
    container.bind(WORKER_TOKEN).toInstance(WorkerImpl).inSingletonScope();
}