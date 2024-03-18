import { token } from "brandi";
import { GatewayServerConfig } from "./gateway_server";
import { LogConfig, } from "./log";
import { UserServiceConfig } from "./user_service";

export class GatewayConfig {
    public gatewayServerConfig = new GatewayServerConfig();
    public logConfig = new LogConfig();
    public userServiceConfig = new UserServiceConfig();

    public static fromEnv(): GatewayConfig {
        const config = new GatewayConfig();
        config.gatewayServerConfig = GatewayServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.userServiceConfig = UserServiceConfig.fromEnv();
        return config;
    }
}

export const GATEWAY_CONFIG_TOKEN = token<GatewayConfig>("GatewayConfig")