import { injected, token } from "brandi";
import { Consumer } from "kafkajs";
import { Logger } from "winston";
import { KafkaConfig, KAFKA_CONFIG_TOKEN } from "../../../config";
import { LOGGER_TOKEN } from "../../../utils";
import { KAFKA_CONSUMER_TOKEN } from "./consumer";

export type MessageHandlerFunc = (message: Buffer | null) => Promise<void>;

export interface MessageHandler {
    topic: string;
    onMessage: MessageHandlerFunc;
}

export interface MessageConsumer {
    registerHandlerListAndStart(handlerList: MessageHandler[]): Promise<void>;
}

export class MessageConsumerImpl implements MessageConsumer {
    constructor(
        private readonly consumer: Consumer,
        private readonly kafkaConfig: KafkaConfig,
        private readonly logger: Logger
    ) { }

    public async registerHandlerListAndStart(handlerList: MessageHandler[]): Promise<void> {
        const topicToHandlerMap = this.getTopicToHandlerMap(handlerList);
        await this.consumer.connect();
        for (const handler of handlerList) {
            await this.consumer.subscribe({
                topic: handler.topic,
                fromBeginning: true,
            });
        }
        await this.consumer.run({
            eachMessage: async ({ topic, message, heartbeat }) => {
                const handler = topicToHandlerMap.get(topic);
                if (handler === undefined) {
                    return;
                }

                const heartbeatInterval = setInterval(
                    async () => await heartbeat(),
                    this.kafkaConfig.heartbeatInterval
                );

                try {
                    handler(message.value);
                } catch (error) {
                    this.logger.error("failed to handle message", { topic, message: message.value, error });
                    throw error;
                } finally {
                    clearInterval(heartbeatInterval);
                }
            },
        });
    }

    private getTopicToHandlerMap(handlerList: MessageHandler[]): Map<string, MessageHandlerFunc> {
        return new Map(handlerList.map((handler) => [handler.topic, handler.onMessage]));
    }
}

injected(MessageConsumerImpl, KAFKA_CONSUMER_TOKEN, KAFKA_CONFIG_TOKEN, LOGGER_TOKEN);

export const MESSAGE_CONSUMER_TOKEN = token<MessageConsumerImpl>("MessageConsumer");
