import { Container } from "brandi";
import { USER_SERVICE_HANDLERS_FACTORY_TOKEN, UserServiceHandlersFactory } from "./handler";
import { USER_SERVICE_GRPC_SERVER_TOKEN, UserServiceGRPCServer } from "./server";

export * from "./handler";
export * from "./server";

export function bindToContainer(container: Container): void {
    container.bind(USER_SERVICE_HANDLERS_FACTORY_TOKEN).toInstance(UserServiceHandlersFactory).inSingletonScope();
    container.bind(USER_SERVICE_GRPC_SERVER_TOKEN).toInstance(UserServiceGRPCServer).inSingletonScope();
}