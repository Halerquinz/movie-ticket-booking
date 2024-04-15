import { Server, ServerCredentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { Logger } from "winston";
import { GRPCServerConfig, GRPC_SERVER_CONFIG_TOKEN } from "../config";
import { LOGGER_TOKEN } from "../utils/logging";
import { MOVIE_SERVICE_HANDLERS_FACTORY_TOKEN, MovieServiceHandlerFactory, } from "./handler";
import { ProtoGrpcType } from "../proto/gen/movie_service";

export class MovieServiceGRPCServer {
    constructor(
        private readonly handlerFactory: MovieServiceHandlerFactory,
        private readonly grpcServerConfig: GRPCServerConfig,
        private readonly logger: Logger
    ) { }

    public async loadProtoAndStartServer(protoPath: string) {
        const movieServiceProtoGrpc = this.loadUserServiceProtoGrpc(protoPath);

        const server = new Server({
            "grpc.max_send_message_length": -1,
            "grpc.max_receive_message_length": -1
        });
        server.addService(movieServiceProtoGrpc.MovieService.service, this.handlerFactory.getMovieServiceHandlers());
        server.bindAsync(`0.0.0.0:${this.grpcServerConfig.port}`, ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                this.logger.error("fail to start grpc server");
            }

            console.log(`start grpc server on port ${port}`);
            this.logger.info(`start grpc server on port ${port}`);
        });
    }

    private loadUserServiceProtoGrpc(protoPath: string): ProtoGrpcType {
        const packageDefinition = loadSync(protoPath, {
            enums: Number,
            keepCase: false,
            defaults: false,
            oneofs: true,
            longs: Number
        })
        const packageObject = loadPackageDefinition(packageDefinition) as unknown;
        return packageObject as ProtoGrpcType;
    }
}

injected(MovieServiceGRPCServer, MOVIE_SERVICE_HANDLERS_FACTORY_TOKEN, GRPC_SERVER_CONFIG_TOKEN, LOGGER_TOKEN);

export const MOVIE_SERVICE_GRPC_SERVER_TOKEN = token<MovieServiceGRPCServer>("MovieServiceGRPCServer");