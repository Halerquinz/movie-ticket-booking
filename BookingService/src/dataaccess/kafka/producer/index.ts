import { Container } from "brandi";
import { KAFKA_PRODUCER_TOKEN, getKafkaProducer } from "./producer";

export * from "./producer";

export function bindToContainer(container: Container): void {
    container.bind(KAFKA_PRODUCER_TOKEN).toInstance(getKafkaProducer).inSingletonScope();
}