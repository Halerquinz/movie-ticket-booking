import { Server, ServerCredentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { Logger } from "winston";
import { GRPCServerConfig, GRPC_SERVER_CONFIG_TOKEN } from "../config";
import { ProtoGrpcType } from "../proto/gen/user_service";
import { LOGGER_TOKEN } from "../utils/logging";
import { USER_SERVICE_HANDLERS_FACTORY_TOKEN, UserServiceHandlersFactory } from "./handler";

export class UserServiceGRPCServer {
    constructor(
        private readonly handlerFactory: UserServiceHandlersFactory,
        private readonly grpcServerConfig: GRPCServerConfig,
        private readonly logger: Logger
    ) { }

    public async loadProtoAndStartServer(protoPath: string) {
        const userServiceProtoGrpc = this.loadUserServiceProtoGrpc(protoPath);

        const server = new Server();
        server.addService(userServiceProtoGrpc.UserService.service, this.handlerFactory.getUserServiceHandlers());
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

injected(UserServiceGRPCServer, USER_SERVICE_HANDLERS_FACTORY_TOKEN, GRPC_SERVER_CONFIG_TOKEN, LOGGER_TOKEN);

export const USER_SERVICE_GRPC_SERVER_TOKEN = token<UserServiceGRPCServer>("UserServiceGRPCServer");