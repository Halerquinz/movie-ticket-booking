
import { injected, token } from "brandi";
import { Logger } from "winston";
import {
    BinaryConverter,
    BINARY_CONVERTER_TOKEN,
    LOGGER_TOKEN,
} from "../utils";
import { MessageConsumer, MESSAGE_CONSUMER_TOKEN } from "../dataaccess/kafka/consumer";
import { SCREEN_CREATED_MESSAGE_HANDLER_TOKEN, ScreenCreatedMessageHandler } from "./screen_created";

const TopicNameMovieServiceScreenCreated = "movie_service_screen_created";

export class MovieServiceKafkaConsumer {
    constructor(
        private readonly messageConsumer: MessageConsumer,
        private readonly screenCreatedMessageHandler: ScreenCreatedMessageHandler,
        private readonly binaryConverter: BinaryConverter,
        private readonly logger: Logger
    ) { }

    public start(): void {
        this.messageConsumer
            .registerHandlerListAndStart([
                {
                    topic: TopicNameMovieServiceScreenCreated,
                    onMessage: (message) =>
                        this.onScreenCreated(message),
                },
            ])
            .then(() => {
                if (process.send) {
                    process.send("ready");
                }
            });
    }

    private async onScreenCreated(message: Buffer | null): Promise<void> {
        if (message === null) {
            this.logger.error("null message, skipping");
            return;
        }
        const screenCreatedMessage = this.binaryConverter.fromBuffer(message);
        await this.screenCreatedMessageHandler.onScreenCreated(
            screenCreatedMessage
        );
    }

}

injected(
    MovieServiceKafkaConsumer,
    MESSAGE_CONSUMER_TOKEN,
    SCREEN_CREATED_MESSAGE_HANDLER_TOKEN,
    BINARY_CONVERTER_TOKEN,
    LOGGER_TOKEN
);

export const MOVIE_SERVICE_KAFKA_CONSUMER_TOKEN =
    token<MovieServiceKafkaConsumer>("MovieServiceKafkaConsumer");