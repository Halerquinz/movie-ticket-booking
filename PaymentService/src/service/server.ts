import { Server, ServerCredentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { Logger } from "winston";
import { GRPCServerConfig, GRPC_SERVER_CONFIG_TOKEN } from "../config";
import { LOGGER_TOKEN } from "../utils/logging";
import { PAYMENT_SERVICE_HANDLERS_FACTORY_TOKEN, PaymentServiceHandlersFactory } from "./handler";
import { ProtoGrpcType } from "../proto/gen/payment_service";

export class PaymentServiceGRPCServer {
    constructor(
        private readonly handlerFactory: PaymentServiceHandlersFactory,
        private readonly grpcServerConfig: GRPCServerConfig,
        private readonly logger: Logger
    ) { }

    public async loadProtoAndStartServer(protoPath: string) {
        const paymentServiceProtoGrpc = this.loadPaymentServiceProtoGrpc(protoPath);

        const server = new Server();
        server.addService(paymentServiceProtoGrpc.PaymentService.service, this.handlerFactory.getPaymentServiceHandlers());
        server.bindAsync(`0.0.0.0:${this.grpcServerConfig.port}`, ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                this.logger.error("failed to start grpc server");
            }

            console.log(`start grpc server on port ${port}`);
            this.logger.info(`start grpc server on port ${port}`);
        });
    }

    private loadPaymentServiceProtoGrpc(protoPath: string): ProtoGrpcType {
        const packageDefinition = loadSync(protoPath, {
            enums: Number,
            keepCase: false,
            defaults: false,
            oneofs: true,
            longs: Number
        });
        const packageObject = loadPackageDefinition(packageDefinition) as unknown;
        return packageObject as ProtoGrpcType;
    }
}

injected(
    PaymentServiceGRPCServer,
    PAYMENT_SERVICE_HANDLERS_FACTORY_TOKEN,
    GRPC_SERVER_CONFIG_TOKEN,
    LOGGER_TOKEN
);

export const PAYMENT_SERVICE_GRPC_SERVER_TOKEN = token<PaymentServiceGRPCServer>("PaymentServiceGRPCServer");