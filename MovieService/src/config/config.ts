import { token } from "brandi";
import { DatabaseConfig } from "./database";
import { GRPCServerConfig } from "./grpc_server";
import { LogConfig } from "./log";
import { DistributedConfig } from "./distributed";
import { ApplicationConfig } from "./application";
import { ElasticsearchConfig } from "./elasticsearch";
import { S3Config } from "./s3";

export class UserServiceConfig {
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();
    public logConfig = new LogConfig();
    public distributedConfig = new DistributedConfig();
    public applicationConfig = new ApplicationConfig();
    public elasticsearchConfig = new ElasticsearchConfig();
    public s3Config = new S3Config();

    public static fromEnv(): UserServiceConfig {
        const config = new UserServiceConfig();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.distributedConfig = DistributedConfig.fromEnv();
        config.applicationConfig = ApplicationConfig.fromEnv();
        config.elasticsearchConfig = ElasticsearchConfig.fromEnv();
        config.s3Config = S3Config.fromEnv();
        return config;
    }
}

export const USER_SERVICE_CONFIG_TOKEN = token<UserServiceConfig>("UserServiceConfig");