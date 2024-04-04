import { Container } from "brandi";
import { AUTH_MIDDLEWARE_FACTORY_TOKEN, AuthMiddlewareFactoryImpl } from "./auth_middleware";
import { ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN, ErrorHandlerMiddlewareFactoryImpl } from "./error_handler_middleware";

export * from "./auth_middleware";
export * from "./cookie";
export * from "./error_handler_middleware";
export * from "./id_list";
export * from "./multer_upload_single_middleware";
export * from "./permission";

export function bindToContainer(container: Container): void {
    container.bind(AUTH_MIDDLEWARE_FACTORY_TOKEN).toInstance(AuthMiddlewareFactoryImpl).inSingletonScope();
    container.bind(ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN).toInstance(ErrorHandlerMiddlewareFactoryImpl).inSingletonScope();

}