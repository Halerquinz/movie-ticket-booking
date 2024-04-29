import { injected, token } from "brandi";
import { Kafka, Partitioners, Producer } from "kafkajs";
import { KAFKA_INSTANCE_TOKEN } from "../kafka";

export function getKafkaProducer(kafka: Kafka): Producer {
    return kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
}

injected(getKafkaProducer, KAFKA_INSTANCE_TOKEN);

export const KAFKA_PRODUCER_TOKEN = token<Producer>("Producer");