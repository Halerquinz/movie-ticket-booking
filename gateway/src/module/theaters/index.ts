import { Container } from "brandi";
import { THEATER_MANAGEMENT_OPERATOR_TOKEN, TheaterManagementOperatorImpl } from "./theater_management_operator";

export * from "./theater_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(THEATER_MANAGEMENT_OPERATOR_TOKEN).toInstance(TheaterManagementOperatorImpl).inSingletonScope();
}