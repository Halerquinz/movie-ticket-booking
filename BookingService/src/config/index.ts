import { Container } from "brandi";
import { BOOKING_SERVICE_CONFIG_TOKEN, BookingServiceConfig } from "./config";
import { DATABASE_CONFIG_TOKEN } from "./database";
import { GRPC_SERVER_CONFIG_TOKEN } from "./grpc_server";
import { LOG_CONFIG_TOKEN } from "./log";
import { DISTRIBUTED_CONFIG_TOKEN } from "./distributed";
import { APPLICATION_CONFIG_TOKEN } from "./application";
import { ELASTICSEARCH_CONFIG_TOKEN } from "./elasticsearch";
import { USER_SERVICE_CONFIG_TOKEN } from "./user_service";
import { MOVIE_SERVICE_CONFIG_TOKEN } from "./movie_service";
import { CACHE_CONFIG_TOKEN } from "./cache";
import { KAFKA_CONFIG_TOKEN } from "./kafka";

export * from "./config";
export * from "./database";
export * from "./grpc_server";
export * from "./log";
export * from "./distributed";
export * from "./application";
export * from "./elasticsearch";
export * from "./user_service";
export * from "./movie_service";
export * from "./cache";
export * from "./kafka";

export function bindToContainer(container: Container): void {
    container.bind(BOOKING_SERVICE_CONFIG_TOKEN).toInstance(BookingServiceConfig.fromEnv).inSingletonScope();
    container
        .bind(DATABASE_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().databaseConfig)
        .inSingletonScope();
    container
        .bind(GRPC_SERVER_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().grpcServerConfig)
        .inSingletonScope();
    container
        .bind(LOG_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().logConfig)
        .inSingletonScope();
    container
        .bind(DISTRIBUTED_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().distributedConfig)
        .inSingletonScope();
    container
        .bind(APPLICATION_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().applicationConfig)
        .inSingletonScope();
    container
        .bind(ELASTICSEARCH_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().elasticsearchConfig)
        .inSingletonScope();
    container
        .bind(USER_SERVICE_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().userServiceConfig)
        .inSingletonScope();
    container
        .bind(MOVIE_SERVICE_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().movieServiceConfig)
        .inSingletonScope();
    container
        .bind(CACHE_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().cacheConfig)
        .inSingletonScope();
    container
        .bind(KAFKA_CONFIG_TOKEN)
        .toInstance(() => BookingServiceConfig.fromEnv().kafkaConfig)
        .inSingletonScope();
}
