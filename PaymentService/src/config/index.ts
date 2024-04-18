import { Container } from "brandi";
import { PAYMENT_SERVICE_CONFIG_TOKEN, PaymentServiceConfig } from "./config";
import { DATABASE_CONFIG_TOKEN } from "./database";
import { GRPC_SERVER_CONFIG_TOKEN } from "./grpc_server";
import { LOG_CONFIG_TOKEN } from "./log";
import { DISTRIBUTED_CONFIG_TOKEN } from "./distributed";
import { APPLICATION_CONFIG_TOKEN } from "./application";
import { ELASTICSEARCH_CONFIG_TOKEN } from "./elasticsearch";

export * from "./config";
export * from "./database";
export * from "./grpc_server";
export * from "./log";
export * from "./distributed";
export * from "./application";
export * from "./elasticsearch";

export function bindToContainer(container: Container): void {
    container.bind(PAYMENT_SERVICE_CONFIG_TOKEN).toInstance(PaymentServiceConfig.fromEnv).inSingletonScope();
    container
        .bind(DATABASE_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().databaseConfig)
        .inSingletonScope();
    container
        .bind(GRPC_SERVER_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().grpcServerConfig)
        .inSingletonScope();
    container
        .bind(LOG_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().logConfig)
        .inSingletonScope();
    container
        .bind(DISTRIBUTED_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().distributedConfig)
        .inSingletonScope();
    container
        .bind(APPLICATION_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().applicationConfig)
        .inSingletonScope();
    container
        .bind(ELASTICSEARCH_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().elasticsearchConfig)
        .inSingletonScope();
}
