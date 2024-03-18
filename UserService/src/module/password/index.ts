import { Container } from "brandi";
import { BcryptHasher, HASHER_TOKEN } from "./hasher";
import { USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN, UserPasswordManagementOperatorImpl } from "./user_password_management_operator";

export * from "./hasher";
export * from "./user_password_management_operator";

export function bindToContainer(container: Container) {
    container.bind(HASHER_TOKEN).toInstance(BcryptHasher).inSingletonScope();
    container.bind(USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN).toInstance(UserPasswordManagementOperatorImpl).inSingletonScope();
}
