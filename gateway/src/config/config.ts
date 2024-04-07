import { token } from "brandi";
import { GatewayServerConfig } from "./gateway_server";
import { LogConfig, } from "./log";
import { UserServiceConfig } from "./user_service";
import { ElasticsearchConfig } from "./elasticsearch";
import { MovieServiceConfig } from "./movie_service";
import { ApplicationConfig } from "./application";

export class GatewayConfig {
    public gatewayServerConfig = new GatewayServerConfig();
    public logConfig = new LogConfig();
    public userServiceConfig = new UserServiceConfig();
    public movieServiceConfig = new MovieServiceConfig();
    public elasticsearchConfig = new ElasticsearchConfig();
    public applicationConfig = new ApplicationConfig();

    public static fromEnv(): GatewayConfig {
        const config = new GatewayConfig();
        config.gatewayServerConfig = GatewayServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.userServiceConfig = UserServiceConfig.fromEnv();
        config.movieServiceConfig = MovieServiceConfig.fromEnv();
        config.elasticsearchConfig = ElasticsearchConfig.fromEnv();
        config.applicationConfig = ApplicationConfig.fromEnv();
        return config;
    }
}

export const GATEWAY_CONFIG_TOKEN = token<GatewayConfig>("GatewayConfig");