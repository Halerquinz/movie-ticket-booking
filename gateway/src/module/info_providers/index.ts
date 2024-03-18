import { Container } from "brandi";
import { USER_INFO_PROVIDER_TOKEN, UserInfoProviderImpl } from "./user_info_provider";

export * from "./user_info_provider";

export function bindToContainer(container: Container) {
    container.bind(USER_INFO_PROVIDER_TOKEN).toInstance(UserInfoProviderImpl).inSingletonScope();
}