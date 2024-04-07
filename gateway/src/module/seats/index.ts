import { Container } from "brandi";
import { SEAT_MANAGEMENT_OPERATOR_TOKEN, SeatManagementOperatorImpl } from "./seat_management_operator";

export * from "./seat_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(SEAT_MANAGEMENT_OPERATOR_TOKEN).toInstance(SeatManagementOperatorImpl).inSingletonScope();
}