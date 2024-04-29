import { Producer } from "kafkajs";
import { Logger } from "winston";
import { BINARY_CONVERTER_TOKEN, BinaryConverter, ErrorWithStatus, LOGGER_TOKEN } from "../../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KAFKA_PRODUCER_TOKEN } from "./producer";
import { PaymentTransactionStatus } from "../../db";

export class PaymentTransactionCompleted {
    constructor(
        public ofBookingId: number,
        public paymentTransactionStatus: PaymentTransactionStatus
    ) { }
}

export interface PaymentTransactionCompletedProducer {
    createPaymentTransactionCompletedMessage(message: PaymentTransactionCompleted): Promise<void>;
}

const TopicNameMovieServiceScreenCreated = "payment_service_payment_transaction_completed";

export class PaymentTransactionCompletedProducerImpl implements PaymentTransactionCompletedProducer {
    constructor(
        private readonly producer: Producer,
        private readonly binaryConverter: BinaryConverter,
        private readonly logger: Logger
    ) { }

    public async createPaymentTransactionCompletedMessage(message: PaymentTransactionCompleted): Promise<void> {
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
    PaymentTransactionCompletedProducerImpl,
    KAFKA_PRODUCER_TOKEN,
    BINARY_CONVERTER_TOKEN,
    LOGGER_TOKEN
);

export const PAYMENT_TRANSACTION_COMPLETED_PRODUCER_TOKEN =
    token<PaymentTransactionCompletedProducer>("PaymentTransactionCompletedProducer");

