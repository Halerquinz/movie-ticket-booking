import { Container } from "brandi";
import { CHECKOUT_OPERATOR_TOKEN, CheckoutOperatorImpl } from "./checkout_operator";
import { CHECKOUT_SESSION_HANDLER_TOKEN, CheckoutSessionHandlerImpl } from "./checkout_session_handler";
import { STRIPE_INSTANCE_TOKEN, getInstanceStripe } from "./stripe";

export * from "./checkout_operator";
export * from "./checkout_session_handler";
export * from "./stripe";

export function bindToContainer(container: Container): void {
    container.bind(STRIPE_INSTANCE_TOKEN).toInstance(getInstanceStripe).inSingletonScope();
    container.bind(CHECKOUT_OPERATOR_TOKEN).toInstance(CheckoutOperatorImpl).inSingletonScope();
    container.bind(CHECKOUT_SESSION_HANDLER_TOKEN).toInstance(CheckoutSessionHandlerImpl).inSingletonScope();
}