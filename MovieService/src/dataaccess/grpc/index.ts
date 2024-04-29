import { Container } from "brandi";
import { BOOKING_SERVICE_DM_TOKEN, getBookingServiceDM } from "./booking_service";

export * from "./booking_service";

export function bindToContainer(container: Container): void {
    container.bind(BOOKING_SERVICE_DM_TOKEN).toInstance(getBookingServiceDM).inSingletonScope();
}