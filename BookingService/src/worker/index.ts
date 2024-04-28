import { Container } from "brandi";
import { BOOKING_SERVICE_WORKER_TOKEN, BookingServiceWorker } from "./worker";

export * from "./worker";

export function bindToContainer(container: Container): void {
    container.bind(BOOKING_SERVICE_WORKER_TOKEN).toInstance(BookingServiceWorker).inSingletonScope();
}