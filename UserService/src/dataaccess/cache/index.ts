import { Container } from "brandi";
import { CACHE_CLIENT_TOKEN, InMemoryClient } from "./client";
import { TOKEN_PUBLIC_KEY_CACHE_DM_TOKEN, TokenPublicKeyCacheDMImpl } from "./token_public_key";

export * from "./client";
export * from "./token_public_key";

export function bindToContainer(container: Container) {
    container.bind(CACHE_CLIENT_TOKEN).toInstance(InMemoryClient).inSingletonScope();
    container.bind(TOKEN_PUBLIC_KEY_CACHE_DM_TOKEN).toInstance(TokenPublicKeyCacheDMImpl).inSingletonScope();
}