import { token } from "brandi";
import { DatabaseConfig } from "./database";
import { GRPCServerConfig } from "./grpc_server";
import { LogConfig } from "./log";
import { DistributedConfig } from "./distributed";
import { ApplicationConfig } from "./application";
import { ElasticsearchConfig } from "./elasticsearch";

export class PaymentServiceConfig {
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();
    public logConfig = new LogConfig();
    public distributedConfig = new DistributedConfig();
    public applicationConfig = new ApplicationConfig();
    public elasticsearchConfig = new ElasticsearchConfig();

    public static fromEnv(): PaymentServiceConfig {
        const config = new PaymentServiceConfig();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.distributedConfig = DistributedConfig.fromEnv();
        config.applicationConfig = ApplicationConfig.fromEnv();
        config.elasticsearchConfig = ElasticsearchConfig.fromEnv();
        return config;
    }
}

export const PAYMENT_SERVICE_CONFIG_TOKEN = token<PaymentServiceConfig>("PaymentServiceConfig");