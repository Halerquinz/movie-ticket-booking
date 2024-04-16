import { Container } from "brandi";
import { SHOWTIME_MANAGEMENT_OPERATOR_TOKEN, ShowtimeManagementOperatorImpl } from "./showtime_management_operator";

export * from "./showtime_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(SHOWTIME_MANAGEMENT_OPERATOR_TOKEN).toInstance(ShowtimeManagementOperatorImpl).inSingletonScope();

}