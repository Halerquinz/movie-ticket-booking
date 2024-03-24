import { Container } from "brandi";
import {
    UserPermissionManagementOperatorImpl,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN,
} from "./user_permission_management_operator";

export * from "./user_permission_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN).toInstance(UserPermissionManagementOperatorImpl).inSingletonScope();
}
