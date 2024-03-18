import { injected, token } from "brandi";
import compression from "compression";
import express from "express";
import { GATEWAY_SERVER_CONFIG_TOKEN, GatewayServerConfig } from "../config/gateway_server";
// import { middleware } from "express-openapi-validator";
import cookieParser from "cookie-parser";
import { Logger } from "winston";
import { ROUTES_TOKEN } from "./routes";
import { ERROR_HANDLER_MIDDLEWARE_TOKEN } from "./utils";
import { LOGGER_TOKEN } from "../utils";

export class GatewayHTTPServer {
    constructor(
        public readonly routes: express.Router[],
        public readonly errorHandler: express.ErrorRequestHandler,
        public readonly logger: Logger,
        public readonly gatewayServerConfig: GatewayServerConfig
    ) { }

    public loadApiDefinitionAndStart(apiSpecPath: string): void {
        const server = this.getGatewayHTTPServer(apiSpecPath);
        server.listen(this.gatewayServerConfig.port, () => {
            console.log(`server http is listening on port ${this.gatewayServerConfig.port} `)
            this.logger.info("started http server", {
                port: this.gatewayServerConfig.port,
            });
        })
    }

    public getGatewayHTTPServer(apiSpecPath: string): express.Express {
        const server = express();
        server.use(express.json({ limit: "1mb" }));
        server.use(express.urlencoded({ extended: true }));
        server.use(cookieParser());
        server.use(compression());
        // server.use(middleware({ apiSpec: apiSpecPath }));
        server.use(this.routes);
        server.use(this.errorHandler);
        return server;
    }
}

injected(GatewayHTTPServer, ROUTES_TOKEN, ERROR_HANDLER_MIDDLEWARE_TOKEN, LOGGER_TOKEN, GATEWAY_SERVER_CONFIG_TOKEN);
// injected(GatewayHTTPServer, ROUTES_TOKEN, LOGGER_TOKEN, GATEWAY_SERVER_CONFIG_TOKEN);

export const GATEWAY_HTTP_SERVER_TOKEN = token<GatewayHTTPServer>("GatewayHTTPServer");

