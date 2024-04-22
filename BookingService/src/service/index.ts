import { Container } from "brandi";
import { BOOKING_SERVICE_HANDLERS_FACTORY_TOKEN, BookingServiceHandlersFactory } from "./handler";
import { BOOKING_SERVICE_GRPC_SERVER_TOKEN, BookingServiceGRPCServer } from "./server";

export * from "./handler";
export * from "./server";

export function bindToContainer(container: Container): void {
    container.bind(BOOKING_SERVICE_HANDLERS_FACTORY_TOKEN).toInstance(BookingServiceHandlersFactory).inSingletonScope();
    container.bind(BOOKING_SERVICE_GRPC_SERVER_TOKEN).toInstance(BookingServiceGRPCServer).inSingletonScope();
}