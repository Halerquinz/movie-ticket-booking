import { injected, token } from "brandi";
import { Consumer, Kafka } from "kafkajs";
import { KAFKA_CONFIG_TOKEN, KafkaConfig } from "../../../config";
import { KAFKA_INSTANCE_TOKEN } from "../kafka";

export function getKafkaConsumer(kafka: Kafka, config: KafkaConfig): Consumer {
    return kafka.consumer({
        groupId: config.consumerGroupId
    });
}

injected(getKafkaConsumer, KAFKA_INSTANCE_TOKEN, KAFKA_CONFIG_TOKEN);

export const KAFKA_CONSUMER_TOKEN = token<Consumer>("Consumer");