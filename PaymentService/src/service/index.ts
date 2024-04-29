import { Container } from "brandi";
import { PAYMENT_SERVICE_HANDLERS_FACTORY_TOKEN, PaymentServiceHandlersFactory } from "./handler";
import { PAYMENT_SERVICE_GRPC_SERVER_TOKEN, PaymentServiceGRPCServer } from "./server";
import { WEBHOOK_HTTP_SERVER_TOKEN, WebhookHTTPServer } from "./webhook_server";

export * from "./handler";
export * from "./server";
export * from "./webhook_server";

export function bindToContainer(container: Container): void {
    container.bind(PAYMENT_SERVICE_HANDLERS_FACTORY_TOKEN).toInstance(PaymentServiceHandlersFactory).inSingletonScope();
    container.bind(PAYMENT_SERVICE_GRPC_SERVER_TOKEN).toInstance(PaymentServiceGRPCServer).inSingletonScope();
    container.bind(WEBHOOK_HTTP_SERVER_TOKEN).toInstance(WebhookHTTPServer).inSingletonScope();
}