import { Container } from "brandi";
import { MOVIE_SERVICE_CONFIG_TOKEN, MovieServiceConfig } from "./config";
import { DATABASE_CONFIG_TOKEN } from "./database";
import { GRPC_SERVER_CONFIG_TOKEN } from "./grpc_server";
import { LOG_CONFIG_TOKEN } from "./log";
import { DISTRIBUTED_CONFIG_TOKEN } from "./distributed";
import { APPLICATION_CONFIG_TOKEN } from "./application";
import { ELASTICSEARCH_CONFIG_TOKEN } from "./elasticsearch";
import { S3_CONFIG_TOKEN } from "./s3";
import { KAFKA_CONFIG_TOKEN } from "./kafka";

export * from "./config";
export * from "./database";
export * from "./grpc_server";
export * from "./log";
export * from "./distributed";
export * from "./application";
export * from "./elasticsearch";
export * from "./s3";
export * from "./kafka";

export function bindToContainer(container: Container): void {
    container.bind(MOVIE_SERVICE_CONFIG_TOKEN).toInstance(MovieServiceConfig.fromEnv).inSingletonScope();
    container
        .bind(DATABASE_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().databaseConfig)
        .inSingletonScope();
    container
        .bind(GRPC_SERVER_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().grpcServerConfig)
        .inSingletonScope();
    container
        .bind(LOG_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().logConfig)
        .inSingletonScope();
    container
        .bind(DISTRIBUTED_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().distributedConfig)
        .inSingletonScope();
    container
        .bind(APPLICATION_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().applicationConfig)
        .inSingletonScope();
    container
        .bind(ELASTICSEARCH_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().elasticsearchConfig)
        .inSingletonScope();
    container
        .bind(S3_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().s3Config)
        .inSingletonScope();

    container
        .bind(KAFKA_CONFIG_TOKEN)
        .toInstance(() => MovieServiceConfig.fromEnv().kafkaConfig)
        .inSingletonScope();
}
