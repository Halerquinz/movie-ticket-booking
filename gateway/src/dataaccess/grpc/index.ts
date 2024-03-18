import { Container } from "brandi";
import { USER_SERVICE_DM_TOKEN, getUserServiceDM } from "./user_service";

export * from "./user_service";

export function bindToContainer(container: Container): void {
    container.bind(USER_SERVICE_DM_TOKEN).toInstance(getUserServiceDM).inSingletonScope();
}