import { Container } from "brandi";
import { LOGGER_TOKEN, initializeLogger } from "./logging";

export * from "./logging";
export * from "./grpc";
export * from "./errors";
export * from "./sensitive_info";

export function bindToContainer(container: Container): void {
    container.bind(LOGGER_TOKEN).toInstance(initializeLogger).inSingletonScope();
}