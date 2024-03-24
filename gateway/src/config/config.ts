import { token } from "brandi";
import { GatewayServerConfig } from "./gateway_server";
import { LogConfig, } from "./log";
import { UserServiceConfig } from "./user_service";
import { ElasticsearchConfig } from "./elasticsearch";

export class GatewayConfig {
    public gatewayServerConfig = new GatewayServerConfig();
    public logConfig = new LogConfig();
    public userServiceConfig = new UserServiceConfig();
    public elasticsearchConfig = new ElasticsearchConfig();

    public static fromEnv(): GatewayConfig {
        const config = new GatewayConfig();
        config.gatewayServerConfig = GatewayServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.userServiceConfig = UserServiceConfig.fromEnv();
        config.elasticsearchConfig = ElasticsearchConfig.fromEnv();
        return config;
    }
}

export const GATEWAY_CONFIG_TOKEN = token<GatewayConfig>("GatewayConfig")