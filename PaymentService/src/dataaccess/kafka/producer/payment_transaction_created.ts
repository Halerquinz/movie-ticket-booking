import { Producer } from "kafkajs";
import { Logger } from "winston";
import { BINARY_CONVERTER_TOKEN, BinaryConverter, ErrorWithStatus, LOGGER_TOKEN } from "../../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KAFKA_PRODUCER_TOKEN } from "./producer";
import { PaymentTransactionStatus } from "../../db";

export class PaymentTransactionCreated {
    constructor(
        public ofBookingId: number,
    ) { }
}

export interface PaymentTransactionCreatedProducer {
    createPaymentTransactionCreatedMessage(message: PaymentTransactionCreated): Promise<void>;
}

const TopicNameMovieServiceScreenCreated = "payment_service_payment_transaction_created";

export class PaymentTransactionCreatedProducerImpl implements PaymentTransactionCreatedProducer {
    constructor(
        private readonly producer: Producer,
        private readonly binaryConverter: BinaryConverter,
        private readonly logger: Logger
    ) { }

    public async createPaymentTransactionCreatedMessage(message: PaymentTransactionCreated): Promise<void> {
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
    PaymentTransactionCreatedProducerImpl,
    KAFKA_PRODUCER_TOKEN,
    BINARY_CONVERTER_TOKEN,
    LOGGER_TOKEN
);

export const PAYMENT_TRANSACTION_CREATED_PRODUCER_TOKEN =
    token<PaymentTransactionCreatedProducer>("PaymentTransactionCreatedProducer");

