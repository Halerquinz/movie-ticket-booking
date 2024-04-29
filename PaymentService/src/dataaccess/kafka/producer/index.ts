import { Container } from "brandi";
import { PAYMENT_TRANSACTION_COMPLETED_PRODUCER_TOKEN, PaymentTransactionCompletedProducerImpl } from "./payment_transaction_completed";
import { KAFKA_PRODUCER_TOKEN, getKafkaProducer } from "./producer";
import { PAYMENT_TRANSACTION_CREATED_PRODUCER_TOKEN, PaymentTransactionCreatedProducerImpl } from "./payment_transaction_created";

export * from "./producer";
export * from "./payment_transaction_completed";
export * from "./payment_transaction_created";

export function bindToContainer(container: Container): void {
    container.bind(KAFKA_PRODUCER_TOKEN).toInstance(getKafkaProducer).inSingletonScope();
    container.bind(PAYMENT_TRANSACTION_COMPLETED_PRODUCER_TOKEN).toInstance(PaymentTransactionCompletedProducerImpl).inSingletonScope();
    container.bind(PAYMENT_TRANSACTION_CREATED_PRODUCER_TOKEN).toInstance(PaymentTransactionCreatedProducerImpl).inSingletonScope();
}