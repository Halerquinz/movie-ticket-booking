import { Container } from "brandi";
import { MOVIE_SERVICE_HANDLERS_FACTORY_TOKEN, MovieServiceHandlerFactory } from "./handler";
import { MOVIE_SERVICE_GRPC_SERVER_TOKEN, MovieServiceGRPCServer } from "./server";

export * from "./handler";
export * from "./server";

export function bindToContainer(container: Container): void {
    container.bind(MOVIE_SERVICE_HANDLERS_FACTORY_TOKEN).toInstance(MovieServiceHandlerFactory).inSingletonScope();
    container.bind(MOVIE_SERVICE_GRPC_SERVER_TOKEN).toInstance(MovieServiceGRPCServer).inSingletonScope();
}