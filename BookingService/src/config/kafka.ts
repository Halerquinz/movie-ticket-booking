import { token } from "brandi";

export class KafkaConfig {
    public clientId = "booking_service";
    public consumerGroupId = "booking_service";
    public brokers: string[] = [];
    public heartbeatInterval = 10000;

    public static fromEnv(): KafkaConfig {
        const config = new KafkaConfig();
        if (process.env.KAFKA_CLIENT_ID !== undefined) {
            config.clientId = process.env.KAFKA_CLIENT_ID;
        }
        if (process.env.KAFKA_CONSUMER_GROUP_ID !== undefined) {
            config.consumerGroupId = process.env.KAFKA_CONSUMER_GROUP_ID;
        }
        if (process.env.KAFKA_BROKERS !== undefined) {
            config.brokers = process.env.KAFKA_BROKERS.split(",");
        }
        if (process.env.KAFKA_HEARTBEAT_INTERVAL !== undefined) {
            config.heartbeatInterval = +process.env.KAFKA_HEARTBEAT_INTERVAL;
        }
        return config;
    }
}

export const KAFKA_CONFIG_TOKEN = token<KafkaConfig>("KafkaConfig");