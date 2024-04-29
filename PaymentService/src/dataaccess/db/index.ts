import { Container } from "brandi";
import { KNEX_INSTANCE_TOKEN, newKnexInstance } from "./knex";
import { PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN, PaymentTransactionDataAccessorImpl } from "./payment_transaction";
import { CHECKOUT_SESSION_DATA_ACCESSOR_TOKEN, CheckoutSessionDataAccessorImpl } from "./checkout_session";

export * from "./knex";
export * from "./payment_transaction";
export * from "./checkout_session";

export function bindToContainer(container: Container): void {
    container.bind(KNEX_INSTANCE_TOKEN).toInstance(newKnexInstance).inSingletonScope();
    container.bind(PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN).toInstance(PaymentTransactionDataAccessorImpl).inSingletonScope();
    container.bind(CHECKOUT_SESSION_DATA_ACCESSOR_TOKEN).toInstance(CheckoutSessionDataAccessorImpl).inSingletonScope();
}