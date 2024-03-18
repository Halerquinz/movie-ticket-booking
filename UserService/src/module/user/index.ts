import { Container } from "brandi";
import { USER_MANAGEMENT_OPERATOR_TOKEN, UserManagementOperatorImpl } from "./user_management_operator";

export * from "./user_management_operator";

export function bindToContainer(container: Container) {
    container.bind(USER_MANAGEMENT_OPERATOR_TOKEN).toInstance(UserManagementOperatorImpl).inSingletonScope();
}