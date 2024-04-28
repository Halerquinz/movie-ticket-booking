import { token } from "brandi";
import { DatabaseConfig } from "./database";
import { GRPCServerConfig } from "./grpc_server";
import { LogConfig } from "./log";
import { DistributedConfig } from "./distributed";
import { ApplicationConfig } from "./application";
import { ElasticsearchConfig } from "./elasticsearch";
import { UserServiceConfig } from "./user_service";
import { MovieServiceConfig } from "./movie_service";
import { CacheConfig } from "./cache";
import { KafkaConfig } from "./kafka";
import { RedisConfig } from "./redis";

export class BookingServiceConfig {
    public userServiceConfig = new UserServiceConfig();
    public movieServiceConfig = new MovieServiceConfig();
    public databaseConfig = new DatabaseConfig();
    public grpcServerConfig = new GRPCServerConfig();
    public logConfig = new LogConfig();
    public distributedConfig = new DistributedConfig();
    public applicationConfig = new ApplicationConfig();
    public elasticsearchConfig = new ElasticsearchConfig();
    public cacheConfig = new CacheConfig();
    public kafkaConfig = new KafkaConfig();
    public redisConfig = new RedisConfig();

    public static fromEnv(): BookingServiceConfig {
        const config = new BookingServiceConfig();
        config.userServiceConfig = UserServiceConfig.fromEnv();
        config.movieServiceConfig = MovieServiceConfig.fromEnv();
        config.databaseConfig = DatabaseConfig.fromEnv();
        config.grpcServerConfig = GRPCServerConfig.fromEnv();
        config.logConfig = LogConfig.fromEnv();
        config.distributedConfig = DistributedConfig.fromEnv();
        config.applicationConfig = ApplicationConfig.fromEnv();
        config.elasticsearchConfig = ElasticsearchConfig.fromEnv();
        config.cacheConfig = CacheConfig.fromEnv();
        config.kafkaConfig = KafkaConfig.fromEnv();
        config.redisConfig = RedisConfig.fromEnv();
        return config;
    }
}

export const BOOKING_SERVICE_CONFIG_TOKEN = token<BookingServiceConfig>("BookingServiceConfig");