import { token } from "brandi";

export class GRPCServerConfig {
    public port = 20003;

    public static fromEnv(): GRPCServerConfig {
        const config = new GRPCServerConfig();
        if (process.env.PAYMENT_SERVICE_PORT !== undefined) {
            config.port = +process.env.PAYMENT_SERVICE_PORT;
        }
        return config;
    }
}

export const GRPC_SERVER_CONFIG_TOKEN = token<GRPCServerConfig>("GRPCServerConfig");