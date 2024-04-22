import { Server, ServerCredentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { Logger } from "winston";
import { GRPCServerConfig, GRPC_SERVER_CONFIG_TOKEN } from "../config";
import { LOGGER_TOKEN } from "../utils/logging";
import { BOOKING_SERVICE_HANDLERS_FACTORY_TOKEN, BookingServiceHandlersFactory } from "./handler";
import { ProtoGrpcType } from "../proto/gen/booking_service";

export class BookingServiceGRPCServer {
    constructor(
        private readonly handlerFactory: BookingServiceHandlersFactory,
        private readonly grpcServerConfig: GRPCServerConfig,
        private readonly logger: Logger
    ) { }

    public async loadProtoAndStartServer(protoPath: string) {
        const bookingServiceProtoGrpc = this.loadBookingServiceProtoGrpc(protoPath);

        const server = new Server();
        server.addService(bookingServiceProtoGrpc.BookingService.service, this.handlerFactory.getBookingServiceHandlers());
        server.bindAsync(`0.0.0.0:${this.grpcServerConfig.port}`, ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                this.logger.error("fail to start grpc server");
            }

            console.log(`start grpc server on port ${port}`);
            this.logger.info(`start grpc server on port ${port}`);
        });
    }

    private loadBookingServiceProtoGrpc(protoPath: string): ProtoGrpcType {
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

injected(
    BookingServiceGRPCServer,
    BOOKING_SERVICE_HANDLERS_FACTORY_TOKEN,
    GRPC_SERVER_CONFIG_TOKEN,
    LOGGER_TOKEN
);

export const BOOKING_SERVICE_GRPC_SERVER_TOKEN = token<BookingServiceGRPCServer>("BookingServiceGRPCServer");