import { Container } from "brandi";
import * as consumer from "./consumer";
import * as producer from "./producer";
import { KAFKA_INSTANCE_TOKEN, getInstanceKafka } from "./kafka";

export * from "./consumer";
export * from "./producer";
export * from "./kafka";

export function bindToContainer(container: Container): void {
    container.bind(KAFKA_INSTANCE_TOKEN).toInstance(getInstanceKafka).inSingletonScope();
    consumer.bindToContainer(container);
    producer.bindToContainer(container);
}