import { Container } from "brandi";
import { SHOWTIME_MANAGEMENT_OPERATOR_TOKEN, ShowtimeManagementOperatorImpl } from "./showtime_management_operator";
import { SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN, ShowtimeListManagementOperatorImpl } from "./showtime_list_management_operator";

export * from "./showtime_management_operator";
export * from "./showtime_list_management_operator";

export function bindToContainer(container: Container) {
    container.bind(SHOWTIME_MANAGEMENT_OPERATOR_TOKEN).toInstance(ShowtimeManagementOperatorImpl).inSingletonScope();
    container.bind(SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN).toInstance(ShowtimeListManagementOperatorImpl).inSingletonScope();
}