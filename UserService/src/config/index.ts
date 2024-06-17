import { Container } from "brandi";
import { USER_SERVICE_CONFIG_TOKEN, UserServiceConfig } from "./config";
import { DATABASE_CONFIG_TOKEN } from "./database";
import { GRPC_SERVER_CONFIG_TOKEN } from "./grpc_server";
import { LOG_CONFIG_TOKEN } from "./log";
import { TOKEN_CONFIG_TOKEN } from "./token";
import { DISTRIBUTED_CONFIG_TOKEN } from "./distributed";
import { APPLICATION_CONFIG_TOKEN } from "./application";
import { ELASTICSEARCH_CONFIG_TOKEN } from "./elasticsearch";
import { CACHE_CONFIG_TOKEN } from "./cache";

export * from "./config";
export * from "./database";
export * from "./grpc_server";
export * from "./log";
export * from "./token";
export * from "./distributed";
export * from "./application";
export * from "./elasticsearch";
export * from "./cache";

export function bindToContainer(container: Container): void {
    container.bind(USER_SERVICE_CONFIG_TOKEN).toInstance(UserServiceConfig.fromEnv).inSingletonScope();
    container
        .bind(DATABASE_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().databaseConfig)
        .inSingletonScope();
    container
        .bind(GRPC_SERVER_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().grpcServerConfig)
        .inSingletonScope();
    container
        .bind(LOG_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().logConfig)
        .inSingletonScope();
    container
        .bind(TOKEN_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().tokenConfig)
        .inSingletonScope();
    container
        .bind(DISTRIBUTED_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().distributedConfig)
        .inSingletonScope();
    container
        .bind(APPLICATION_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().applicationConfig)
        .inSingletonScope();
    container
        .bind(ELASTICSEARCH_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().elasticsearchConfig)
        .inSingletonScope();
    container
        .bind(CACHE_CONFIG_TOKEN)
        .toInstance(() => UserServiceConfig.fromEnv().cacheConfig)
        .inSingletonScope();
}
