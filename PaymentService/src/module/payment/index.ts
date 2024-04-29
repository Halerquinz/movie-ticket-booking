import { Container } from "brandi";
import {
    PAYMENT_TRANSACTION_MANAGEMENT_OPERATOR_TOKEN,
    PaymentTransactionManagementOperatorImpl
} from "./payment_transaction_management_operator";

export * from "./payment_transaction_management_operator";
export * from "./payment_transaction_detail_models";

export function bindToContainer(container: Container): void {
    container
        .bind(PAYMENT_TRANSACTION_MANAGEMENT_OPERATOR_TOKEN)
        .toInstance(PaymentTransactionManagementOperatorImpl)
        .inSingletonScope();
}