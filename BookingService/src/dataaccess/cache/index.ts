import { Container } from "brandi";
import { CACHE_CLIENT_TOKEN, InMemoryClient } from "./client";
import { UserCacheDMImpl, USER_CACHE_DM_TOKEN } from "./user";

export * from "./client";
export * from "./user";

export function bindToContainer(container: Container): void {
    container.bind(CACHE_CLIENT_TOKEN).toInstance(InMemoryClient).inSingletonScope();
    container.bind(USER_CACHE_DM_TOKEN).toInstance(UserCacheDMImpl).inSingletonScope();
}
