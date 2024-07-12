import { credentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { PAYMENT_SERVICE_CONFIG_TOKEN, PaymentServiceConfig } from "../../config";
import { PaymentServiceClient } from "../../proto/gen/payment_service/PaymentService";
import { ProtoGrpcType } from "../../proto/gen/payment_service";


export function getPaymentServiceDM(paymentServiceConfig: PaymentServiceConfig): PaymentServiceClient {
    const paymentServiceProtoGrpc = loadPaymentServiceProtoGrpc(paymentServiceConfig.protoPath);
    return new paymentServiceProtoGrpc.payment_service.PaymentService(
        `${paymentServiceConfig.host}:${paymentServiceConfig.port}`,
        credentials.createInsecure(),
        {
            "grpc.max_receive_message_length": -1,
            "grpc.max_send_message_length": -1,
        }
    );
}

function loadPaymentServiceProtoGrpc(protoPath: string): ProtoGrpcType {
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

injected(getPaymentServiceDM, PAYMENT_SERVICE_CONFIG_TOKEN);

export const PAYMENT_SERVICE_DM_TOKEN = token<PaymentServiceClient>("PaymentServiceClient");
