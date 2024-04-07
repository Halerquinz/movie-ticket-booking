import { Producer } from "kafkajs";
import { Logger } from "winston";
import { BINARY_CONVERTER_TOKEN, BinaryConverter, ErrorWithStatus, LOGGER_TOKEN } from "../../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KAFKA_PRODUCER_TOKEN } from "./producer";

export class ScreenCreated {
    constructor(
        public ofScreenId: number,
        public ofScreenTypeId: number,
    ) { }
}

export interface ScreenCreatedProducer {
    createScreenCreatedMessage(message: ScreenCreated): Promise<void>;
}

const TopicNameMovieServiceScreenCreated = "movie_service_screen_created";

export class ScreenCreatedProducerImpl implements ScreenCreatedProducer {
    constructor(
        private readonly producer: Producer,
        private readonly binaryConverter: BinaryConverter,
        private readonly logger: Logger
    ) { }
    public async createScreenCreatedMessage(message: ScreenCreated): Promise<void> {
        try {
            await this.producer.connect();
            await this.producer.send({
                topic: TopicNameMovieServiceScreenCreated,
                messages: [{ value: this.binaryConverter.toBuffer(message) }],
            });
        } catch (error) {
            this.logger.error(
                `failed to create ${TopicNameMovieServiceScreenCreated} message`,
                { message, error }
            );
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }
}

injected(
    ScreenCreatedProducerImpl,
    KAFKA_PRODUCER_TOKEN,
    BINARY_CONVERTER_TOKEN,
    LOGGER_TOKEN
);

export const SCREEN_CREATED_PRODUCER_TOKEN = token<ScreenCreatedProducer>("ScreenCreatedProducer");

