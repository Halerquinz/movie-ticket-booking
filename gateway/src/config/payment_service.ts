import { token } from "brandi";

export class PaymentServiceConfig {
    public protoPath = "./src/proto/dependencies/payment_service.proto";
    public host = "127.0.0.1";
    public port = 20003;

    public static fromEnv(): PaymentServiceConfig {
        const config = new PaymentServiceConfig();
        if (process.env.PAYMENT_SERVICE_PROTO_PATH !== undefined) {
            config.protoPath = process.env.PAYMENT_SERVICE_PROTO_PATH;
        }
        if (process.env.PAYMENT_SERVICE_HOST !== undefined) {
            config.host = process.env.PAYMENT_SERVICE_HOST;
        }
        if (process.env.PAYMENT_SERVICE_PORT !== undefined) {
            config.port = +process.env.PAYMENT_SERVICE_PORT;
        }
        return config;
    }
}

export const PAYMENT_SERVICE_CONFIG_TOKEN = token<PaymentServiceConfig>("PaymentServiceConfig");