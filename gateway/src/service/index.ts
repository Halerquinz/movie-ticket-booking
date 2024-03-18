import { Container } from "brandi";
import * as utils from "./utils";
import * as routes from "./routes";
import { GATEWAY_HTTP_SERVER_TOKEN, GatewayHTTPServer } from "./server";

export * from "./server";

export function bindToContainer(container: Container): void {
    utils.bindToContainer(container);
    routes.bindToContainer(container);
    container
        .bind(GATEWAY_HTTP_SERVER_TOKEN)
        .toInstance(GatewayHTTPServer)
        .inSingletonScope();
}