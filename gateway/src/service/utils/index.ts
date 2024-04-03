import { Container } from "brandi";
import { AUTH_MIDDLEWARE_FACTORY_TOKEN, AuthMiddlewareFactoryImpl } from "./auth_middleware";
import { ERROR_HANDLER_MIDDLEWARE_TOKEN, getErrorHandlerMiddleware } from "./error_handler_middleware";

export * from "./error_handler_middleware";
export * from "./auth_middleware";
export * from "./cookie";
export * from "./permission";
export * from "./id_list";

export function bindToContainer(container: Container): void {
    container.bind(AUTH_MIDDLEWARE_FACTORY_TOKEN).toInstance(AuthMiddlewareFactoryImpl).inSingletonScope();
    container.bind(ERROR_HANDLER_MIDDLEWARE_TOKEN).toInstance(getErrorHandlerMiddleware).inSingletonScope();
}