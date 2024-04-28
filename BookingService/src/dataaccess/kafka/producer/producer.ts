import { injected, token } from "brandi";
import { Kafka, Producer } from "kafkajs";
import { KAFKA_INSTANCE_TOKEN } from "../kafka";

export function getKafkaProducer(kafka: Kafka): Producer {
    return kafka.producer();
}

injected(getKafkaProducer, KAFKA_INSTANCE_TOKEN);

export const KAFKA_PRODUCER_TOKEN = token<Producer>("Producer");