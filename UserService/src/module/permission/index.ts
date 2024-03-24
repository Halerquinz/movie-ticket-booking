import { Container } from "brandi";
import { USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN, UserPermissionManagementOperatorImpl } from "./user_permission_management_operator";

export * from "./user_permission_management_operator";

export function bindToContainer(container: Container) {
    container.bind(USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN).toInstance(UserPermissionManagementOperatorImpl).inSingletonScope();
}