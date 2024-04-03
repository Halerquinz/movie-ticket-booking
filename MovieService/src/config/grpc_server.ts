import { token } from "brandi";

export class GRPCServerConfig {
    public port = 20001;

    public static fromEnv(): GRPCServerConfig {
        const config = new GRPCServerConfig();
        if (process.env.MOVIE_SERVICE_PORT !== undefined) {
            config.port = +process.env.MOVIE_SERVICE_PORT;
        }
        return config;
    }
}

export const GRPC_SERVER_CONFIG_TOKEN = token<GRPCServerConfig>("GRPCServerConfig");