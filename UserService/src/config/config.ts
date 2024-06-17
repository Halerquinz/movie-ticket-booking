import { token } from "brandi";
import { DatabaseConfig } from "./database";
import { GRPCServerConfig } from "./grpc_server";
import { LogConfig } from "./log";
import { TokenConfig } from "./token";
import { DistributedConfig } from "./distributed";
import { ApplicationConfig } from "./application";
import { ElasticsearchConfig } from "./elasticsearch";
import { CacheConfig } from "./cache";

export class UserServiceConfig {
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();
    public logConfig = new LogConfig();
    public tokenConfig = new TokenConfig();
    public distributedConfig = new DistributedConfig();
    public applicationConfig = new ApplicationConfig();
    public elasticsearchConfig = new ElasticsearchConfig();
    public cacheConfig = new CacheConfig();

    public static fromEnv(): UserServiceConfig {
        const config = new UserServiceConfig();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.tokenConfig = TokenConfig.fromEnv();
        config.distributedConfig = DistributedConfig.fromEnv();
        config.applicationConfig = ApplicationConfig.fromEnv();
        config.elasticsearchConfig = ElasticsearchConfig.fromEnv();
        config.cacheConfig = CacheConfig.fromEnv();
        return config;
    }
}

export const USER_SERVICE_CONFIG_TOKEN = token<UserServiceConfig>("UserServiceConfig");