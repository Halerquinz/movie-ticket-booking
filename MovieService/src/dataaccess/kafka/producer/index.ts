import { Container } from "brandi";
import { KAFKA_PRODUCER_TOKEN, getKafkaProducer } from "./producer";
import { SCREEN_CREATED_PRODUCER_TOKEN, ScreenCreatedProducerImpl } from "./screen_created";

export * from "./producer";
export * from "./screen_created";

export function bindToContainer(container: Container): void {
    container.bind(KAFKA_PRODUCER_TOKEN).toInstance(getKafkaProducer).inSingletonScope();
    container.bind(SCREEN_CREATED_PRODUCER_TOKEN).toInstance(ScreenCreatedProducerImpl).inSingletonScope();
}