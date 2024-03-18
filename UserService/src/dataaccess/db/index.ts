import { Container } from "brandi";
import { KNEX_INSTANCE_TOKEN, newKnexInstance } from "./knex";
import UserDataAccessorImpl, { USER_DATA_ACCESSOR_TOKEN } from "./user";
import { TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN, TokenPublicKeyDataAccessorImpl } from "./token_public_key";
import { BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN, BlacklistedTokenDataAccessorImpl } from "./blacklisted_token";
import { USER_PASSWORD_DATA_ACCESSOR_TOKEN, UserPasswordDataAccessorImpl } from "./user_password";

export * from "./knex";
export * from "./user";
export * from "./user_password";
export * from "./token_public_key";
export * from "./blacklisted_token";

export function bindToContainer(container: Container): void {
    container.bind(KNEX_INSTANCE_TOKEN).toInstance(newKnexInstance).inSingletonScope();
    container.bind(USER_DATA_ACCESSOR_TOKEN).toInstance(UserDataAccessorImpl).inSingletonScope();
    container.bind(USER_PASSWORD_DATA_ACCESSOR_TOKEN).toInstance(UserPasswordDataAccessorImpl).inSingletonScope();
    container.bind(TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN).toInstance(TokenPublicKeyDataAccessorImpl).inSingletonScope();
    container.bind(BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN).toInstance(BlacklistedTokenDataAccessorImpl).inSingletonScope();
}