import { Container } from "brandi";
import { PAYMENT_TRANSACTION_COMPLETED_PRODUCER_TOKEN, PaymentTransactionCompletedProducerImpl } from "./payment_transaction_completed";
import { KAFKA_PRODUCER_TOKEN, getKafkaProducer } from "./producer";

export * from "./producer";
export * from "./payment_transaction_completed";

export function bindToContainer(container: Container): void {
    container.bind(KAFKA_PRODUCER_TOKEN).toInstance(getKafkaProducer).inSingletonScope();
    container.bind(PAYMENT_TRANSACTION_COMPLETED_PRODUCER_TOKEN).toInstance(PaymentTransactionCompletedProducerImpl).inSingletonScope();
}