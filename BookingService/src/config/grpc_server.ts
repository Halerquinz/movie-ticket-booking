import { token } from "brandi";

export class GRPCServerConfig {
    public port = 20000;

    public static fromEnv(): GRPCServerConfig {
        const config = new GRPCServerConfig();
        if (process.env.USER_SERVICE_PORT !== undefined) {
            config.port = +process.env.USER_SERVICE_PORT;
        }
        return config;
    }
}

export const GRPC_SERVER_CONFIG_TOKEN = token<GRPCServerConfig>("GRPCServerConfig");