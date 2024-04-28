import { Container } from "brandi";
import { BOOKING_SERVICE_KAFKA_CONSUMER_TOKEN, BookingServiceKafkaConsumer } from "./consumer";
import { PAYMENT_TRANSACTION_COMPLETED_MESSAGE_HANDLER_TOKEN, PaymentTransactionCompleted, PaymentTransactionCompletedMessageHandlerImpl } from "./payment_transaction_completed";
import { PAYMENT_TRANSACTION_CREATED_MESSAGE_HANDLER_TOKEN, PaymentTransactionCreatedMessageHandlerImpl } from "./payment_transaction_created";

export * from "./consumer";
export * from "./payment_transaction_completed";
export * from "./payment_transaction_created";

export function bindToContainer(container: Container): void {
    container.bind(BOOKING_SERVICE_KAFKA_CONSUMER_TOKEN).toInstance(BookingServiceKafkaConsumer).inSingletonScope();
    container
        .bind(PAYMENT_TRANSACTION_COMPLETED_MESSAGE_HANDLER_TOKEN)
        .toInstance(PaymentTransactionCompletedMessageHandlerImpl).inSingletonScope();
    container
        .bind(PAYMENT_TRANSACTION_CREATED_MESSAGE_HANDLER_TOKEN)
        .toInstance(PaymentTransactionCreatedMessageHandlerImpl).inSingletonScope();
}