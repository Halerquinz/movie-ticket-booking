import { Container } from "brandi";
import { GATEWAY_CONFIG_TOKEN, GatewayConfig } from "./config";
import { GATEWAY_SERVER_CONFIG_TOKEN } from "./gateway_server";
import { LOG_CONFIG_TOKEN } from "./log";
import { USER_SERVICE_CONFIG_TOKEN } from "./user_service";
import { ELASTICSEARCH_CONFIG_TOKEN } from "./elasticsearch";
import { MOVIE_SERVICE_CONFIG_TOKEN } from "./movie_service";

export * from "./config";
export * from "./elasticsearch";
export * from "./gateway_server";
export * from "./log";
export * from "./user_service";
export * from "./movie_service";

export function bindToContainer(container: Container): void {
    container.bind(GATEWAY_CONFIG_TOKEN).toInstance(GatewayConfig.fromEnv).inSingletonScope();
    container
        .bind(LOG_CONFIG_TOKEN)
        .toInstance(() => container.get(GATEWAY_CONFIG_TOKEN).logConfig)
        .inSingletonScope();
    container
        .bind(GATEWAY_SERVER_CONFIG_TOKEN)
        .toInstance(() => container.get(GATEWAY_CONFIG_TOKEN).gatewayServerConfig)
        .inSingletonScope();
    container
        .bind(USER_SERVICE_CONFIG_TOKEN)
        .toInstance(() => container.get(GATEWAY_CONFIG_TOKEN).userServiceConfig)
        .inSingletonScope();
    container
        .bind(MOVIE_SERVICE_CONFIG_TOKEN)
        .toInstance(() => container.get(GATEWAY_CONFIG_TOKEN).movieServiceConfig)
        .inSingletonScope();
    container
        .bind(ELASTICSEARCH_CONFIG_TOKEN)
        .toInstance(() => container.get(GATEWAY_CONFIG_TOKEN).elasticsearchConfig)
        .inSingletonScope();
}