
import { injected, token } from "brandi";
import { Logger } from "winston";
import { MESSAGE_CONSUMER_TOKEN, MessageConsumer } from "../dataaccess/kafka/consumer";
import {
    BINARY_CONVERTER_TOKEN,
    BinaryConverter,
    LOGGER_TOKEN,
} from "../utils";
import { PaymentTransactionCompletedMessageHandler, PAYMENT_TRANSACTION_COMPLETED_MESSAGE_HANDLER_TOKEN } from "./payment_transaction_completed";

const TopicNamePaymentServicePaymentTransactionCompleted = "payment_service_payment_transaction_completed";

export class BookingServiceKafkaConsumer {
    constructor(
        private readonly messageConsumer: MessageConsumer,
        private readonly paymentTransactionCompletedMessageHandler: PaymentTransactionCompletedMessageHandler,
        private readonly binaryConverter: BinaryConverter,
        private readonly logger: Logger
    ) { }

    public start(): void {
        this.messageConsumer
            .registerHandlerListAndStart([
                {
                    topic: TopicNamePaymentServicePaymentTransactionCompleted,
                    onMessage: (message) =>
                        this.onPaymentTransactionCompleted(message),
                },
            ])
            .then(() => {
                if (process.send) {
                    process.send("ready");
                }
            });
    }

    private async onPaymentTransactionCompleted(message: Buffer | null): Promise<void> {
        if (message === null) {
            this.logger.error("null message, skipping");
            return;
        }
        const paymentTransactionCompletedMessage = this.binaryConverter.fromBuffer(message);
        await this.paymentTransactionCompletedMessageHandler.onPaymentTransactionCompleted(
            paymentTransactionCompletedMessage
        );
    }
}

injected(
    BookingServiceKafkaConsumer,
    MESSAGE_CONSUMER_TOKEN,
    PAYMENT_TRANSACTION_COMPLETED_MESSAGE_HANDLER_TOKEN,
    BINARY_CONVERTER_TOKEN,
    LOGGER_TOKEN
);

export const BOOKING_SERVICE_KAFKA_CONSUMER_TOKEN =
    token<BookingServiceKafkaConsumer>("BookingServiceKafkaConsumer");