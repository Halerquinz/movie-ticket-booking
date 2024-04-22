import { Container } from "brandi";
import { BOOKING_OPERATOR_TOKEN, BookingOperatorImpl } from "./booking_operator";
import { BOOKING_MANAGEMENT_OPERATOR_TOKEN, BookingManagementOperatorImpl } from "./booking_management_operator";

export * from "./booking_operator";
export * from "./booking_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(BOOKING_OPERATOR_TOKEN).toInstance(BookingOperatorImpl).inSingletonScope();
    container.bind(BOOKING_MANAGEMENT_OPERATOR_TOKEN).toInstance(BookingManagementOperatorImpl).inSingletonScope();
}