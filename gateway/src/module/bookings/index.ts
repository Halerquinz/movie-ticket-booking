import { Container } from "brandi";
import { BOOKING_MANAGEMENT_OPERATOR_TOKEN, BookingManagementOperatorImpl } from "./booking_management_operator";

export * from "./booking_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(BOOKING_MANAGEMENT_OPERATOR_TOKEN).toInstance(BookingManagementOperatorImpl).inSingletonScope();
}