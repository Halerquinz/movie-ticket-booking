import { Container } from "brandi";
import { SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, ScreenTypeManagementOperatorImpl } from "./screen_type_management_operator";

export * from "./screen_type_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN).toInstance(ScreenTypeManagementOperatorImpl).inSingletonScope();
}