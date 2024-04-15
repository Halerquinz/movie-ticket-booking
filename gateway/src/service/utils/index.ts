import { Container } from "brandi";
import { AUTH_MIDDLEWARE_FACTORY_TOKEN, AuthMiddlewareFactoryImpl } from "./auth_middleware";
import { ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN, ErrorHandlerMiddlewareFactoryImpl } from "./error_handler_middleware";
import * as multer from "./multer_upload";
import { UPLOAD_FILE_MIDDLEWARE_FACTORY, UploadFileMiddlewareFactoryImpl } from "./upload_file_middleware";

export * from "./auth_middleware";
export * from "./cookie";
export * from "./error_handler_middleware";
export * from "./id_list";
export * from "./upload_file_middleware";
export * from "./permission";

export function bindToContainer(container: Container): void {
    container.bind(AUTH_MIDDLEWARE_FACTORY_TOKEN).toInstance(AuthMiddlewareFactoryImpl).inSingletonScope();
    container.bind(ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN).toInstance(ErrorHandlerMiddlewareFactoryImpl).inSingletonScope();
    container.bind(UPLOAD_FILE_MIDDLEWARE_FACTORY).toInstance(UploadFileMiddlewareFactoryImpl).inSingletonScope();
    multer.bindToContainer(container);

}