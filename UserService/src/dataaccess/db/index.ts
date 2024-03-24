import { Container } from "brandi";
import { KNEX_INSTANCE_TOKEN, newKnexInstance } from "./knex";
import UserDataAccessorImpl, { USER_DATA_ACCESSOR_TOKEN } from "./user";
import { TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN, TokenPublicKeyDataAccessorImpl } from "./token_public_key";
import { BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN, BlacklistedTokenDataAccessorImpl } from "./blacklisted_token";
import { USER_PASSWORD_DATA_ACCESSOR_TOKEN, UserPasswordDataAccessorImpl } from "./user_password";
import { USER_ROLE_DATA_ACCESSOR_TOKEN, UserRoleDataAccessorImpl } from "./user_role";
import { USER_PERMISSION_DATA_ACCESSOR_TOKEN, UserPermissionDataAccessorImpl } from "./user_permission";
import { USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN, UserRoleHasUserPermissionDataAccessorImpl } from "./user_role_has_user_permission";
import { USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN, UserHasUserRoleDataAccessorImpl } from "./user_has_user_role";

export * from "./knex";
export * from "./user";
export * from "./user_role";
export * from "./user_permission";
export * from "./user_has_user_role";
export * from "./user_role_has_user_permission";
export * from "./user_password";
export * from "./token_public_key";
export * from "./blacklisted_token";

export function bindToContainer(container: Container): void {
    container.bind(KNEX_INSTANCE_TOKEN).toInstance(newKnexInstance).inSingletonScope();
    container.bind(USER_DATA_ACCESSOR_TOKEN).toInstance(UserDataAccessorImpl).inSingletonScope();
    container.bind(USER_ROLE_DATA_ACCESSOR_TOKEN).toInstance(UserRoleDataAccessorImpl).inSingletonScope();
    container.bind(USER_PERMISSION_DATA_ACCESSOR_TOKEN).toInstance(UserPermissionDataAccessorImpl).inSingletonScope();
    container.bind(USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN).toInstance(UserHasUserRoleDataAccessorImpl).inSingletonScope();
    container.bind(USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN).toInstance(UserRoleHasUserPermissionDataAccessorImpl).inSingletonScope();
    container.bind(BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN).toInstance(BlacklistedTokenDataAccessorImpl).inSingletonScope();
    container.bind(BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN).toInstance(BlacklistedTokenDataAccessorImpl).inSingletonScope();
    container.bind(USER_PASSWORD_DATA_ACCESSOR_TOKEN).toInstance(UserPasswordDataAccessorImpl).inSingletonScope();
    container.bind(TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN).toInstance(TokenPublicKeyDataAccessorImpl).inSingletonScope();
    container.bind(BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN).toInstance(BlacklistedTokenDataAccessorImpl).inSingletonScope();
}