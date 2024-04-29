import { Container } from "brandi";
import { PAYMENT_SERVICE_CONFIG_TOKEN, PaymentServiceConfig } from "./config";
import { DATABASE_CONFIG_TOKEN } from "./database";
import { GRPC_SERVER_CONFIG_TOKEN } from "./grpc_server";
import { LOG_CONFIG_TOKEN } from "./log";
import { DISTRIBUTED_CONFIG_TOKEN } from "./distributed";
import { APPLICATION_CONFIG_TOKEN } from "./application";
import { ELASTICSEARCH_CONFIG_TOKEN } from "./elasticsearch";
import { STRIPE_CONFIG_TOKEN } from "./stripe";
import { REDIS_CONFIG_TOKEN } from "./redis";
import { KAFKA_CONFIG_TOKEN } from "./kafka";
import { MOVIE_SERVICE_CONFIG_TOKEN } from "./movie_service";
import { BOOKING_SERVICE_CONFIG_TOKEN } from "./booking_service";

export * from "./config";
export * from "./database";
export * from "./grpc_server";
export * from "./log";
export * from "./distributed";
export * from "./application";
export * from "./elasticsearch";
export * from "./stripe";
export * from "./redis";
export * from "./kafka";
export * from "./booking_service";
export * from "./movie_service";

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
    container
        .bind(STRIPE_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().stripeConfig)
        .inSingletonScope();
    container
        .bind(REDIS_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().redisConfig)
        .inSingletonScope();
    container
        .bind(KAFKA_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().kafkaConfig)
        .inSingletonScope();
    container
        .bind(MOVIE_SERVICE_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().movieService)
        .inSingletonScope();
    container
        .bind(BOOKING_SERVICE_CONFIG_TOKEN)
        .toInstance(() => PaymentServiceConfig.fromEnv().bookingService)
        .inSingletonScope();
}
