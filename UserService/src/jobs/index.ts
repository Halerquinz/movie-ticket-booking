import { Container } from "brandi";
import { INITIALIZATION_JOB_TOKEN, InitializationJobImpl } from "./initialization";
import { DELETE_EXPIRED_BLACKLISTED_TOKEN_JOB_TOKEN, DeleteExpiredBlacklistedTokenJobImpl } from "./delete_expired_blacklisted_token";

export * from "./initialization";
export * from "./delete_expired_blacklisted_token";

export function bindToContainer(container: Container) {
    container.bind(INITIALIZATION_JOB_TOKEN).toInstance(InitializationJobImpl).inSingletonScope();
    container.bind(DELETE_EXPIRED_BLACKLISTED_TOKEN_JOB_TOKEN).toInstance(DeleteExpiredBlacklistedTokenJobImpl).inSingletonScope();
}