import { token } from "brandi";

export class GatewayServerConfig {
    public port = 8080;

    public static fromEnv(): GatewayServerConfig {
        const config = new GatewayServerConfig();
        if (process.env.GATEWAY_PORT !== undefined) {
            config.port = +process.env.GATEWAY_PORT;
        }

        return config;
    }
}

export const GATEWAY_SERVER_CONFIG_TOKEN = token<GatewayServerConfig>("GatewayServerConfig")
