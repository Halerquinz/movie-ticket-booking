import { Container } from "brandi";
import { USER_ROLE_MANAGEMENT_OPERATOR_TOKEN, UserRoleManagementOperatorImpl } from "./user_role_management_operator";

export * from "./user_role_management_operator";

export function bindToContainer(container: Container) {
    container.bind(USER_ROLE_MANAGEMENT_OPERATOR_TOKEN).toInstance(UserRoleManagementOperatorImpl).inSingletonScope();

}