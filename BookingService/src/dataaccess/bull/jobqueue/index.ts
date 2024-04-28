import { Container } from "brandi";
import { CHECK_BOOKING_STATUS_AFTER_INITIALIZE_QUEUE_TOKEN, CheckBookingStatusAfterInitializeQueueImpl } from "./check_booking_status_after_initialize";

export * from "./check_booking_status_after_initialize";

export function bindToContainer(container: Container): void {
    container.bind(CHECK_BOOKING_STATUS_AFTER_INITIALIZE_QUEUE_TOKEN).toInstance(CheckBookingStatusAfterInitializeQueueImpl).inSingletonScope();
}