import { Container } from "brandi";
import { SCREEN_MANAGEMENT_OPERATOR_TOKEN, ScreenManagementOperatorImpl } from "./screen_management_operator";

export * from "./screen_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(SCREEN_MANAGEMENT_OPERATOR_TOKEN).toInstance(ScreenManagementOperatorImpl).inSingletonScope();
}