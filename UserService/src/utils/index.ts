import { Container } from "brandi";
import { initializeLogger, LOGGER_TOKEN } from "./logging";
import { TimeImpl, TIMER_TOKEN } from "./time";
import { ID_GENERATOR_TOKEN, SnowflakeIdGenerator } from "./snowflake_id";

export * from "./errors";
export * from "./logging";
export * from "./time";
export * from "./snowflake_id";

export function bindToContainer(container: Container): void {
    container.bind(LOGGER_TOKEN).toInstance(initializeLogger).inSingletonScope();
    container.bind(TIMER_TOKEN).toInstance(TimeImpl).inSingletonScope();
    container.bind(ID_GENERATOR_TOKEN).toInstance(SnowflakeIdGenerator).inSingletonScope();
}
