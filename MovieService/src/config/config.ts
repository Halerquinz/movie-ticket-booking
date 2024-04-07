import { token } from "brandi";
import { DatabaseConfig } from "./database";
import { GRPCServerConfig } from "./grpc_server";
import { LogConfig } from "./log";
import { DistributedConfig } from "./distributed";
import { ApplicationConfig } from "./application";
import { ElasticsearchConfig } from "./elasticsearch";
import { S3Config } from "./s3";
import { KafkaConfig } from "./kafka";

export class MovieServiceConfig {
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();
    public logConfig = new LogConfig();
    public distributedConfig = new DistributedConfig();
    public applicationConfig = new ApplicationConfig();
    public elasticsearchConfig = new ElasticsearchConfig();
    public s3Config = new S3Config();
    public kafkaConfig = new KafkaConfig();

    public static fromEnv(): MovieServiceConfig {
        const config = new MovieServiceConfig();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.distributedConfig = DistributedConfig.fromEnv();
        config.applicationConfig = ApplicationConfig.fromEnv();
        config.elasticsearchConfig = ElasticsearchConfig.fromEnv();
        config.s3Config = S3Config.fromEnv();
        config.kafkaConfig = KafkaConfig.fromEnv();
        return config;
    }
}

export const MOVIE_SERVICE_CONFIG_TOKEN = token<MovieServiceConfig>("MovieServiceConfig");