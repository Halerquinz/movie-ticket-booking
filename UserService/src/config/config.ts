import { token } from "brandi";
import { DatabaseConfig } from "./database";
import { GRPCServerConfig } from "./grpc_server";
import { LogConfig } from "./log";
import { TokenConfig } from "./token";
import { DistributedConfig } from "./distributed";

export class UserServiceConfig {
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();
    public logConfig = new LogConfig();
    public tokenConfig = new TokenConfig();
    public distributedConfig = new DistributedConfig();

    public static fromEnv(): UserServiceConfig {
        const config = new UserServiceConfig();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.tokenConfig = TokenConfig.fromEnv();
        config.distributedConfig = DistributedConfig.fromEnv();
        return config;
    }
}

export const USER_SERVICE_CONFIG_TOKEN = token<UserServiceConfig>("UserServiceConfig");