import { Container } from "brandi";
import { INITIALIZATION_JOB_TOKEN, InitializationJobImpl } from "./initialization";

export * from "./initialization";

export function bindToContainer(container: Container): void {
    container.bind(INITIALIZATION_JOB_TOKEN).toInstance(InitializationJobImpl).inSingletonScope();
}