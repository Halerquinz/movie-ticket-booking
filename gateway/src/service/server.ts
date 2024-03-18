import { injected, token } from "brandi";
import compression from "compression";
import express, { Request, Response, NextFunction } from "express";
import { GATEWAY_SERVER_CONFIG_TOKEN, GatewayServerConfig } from "../config/gateway_server";
// import { middleware } from "express-openapi-validator";
import cookieParser from "cookie-parser";
import { Logger } from "winston";
import { ROUTES_TOKEN } from "./routes";
import { ERROR_HANDLER_MIDDLEWARE_TOKEN } from "./utils";
import { LOGGER_TOKEN } from "../utils";

export class GatewayHTTPServer {
    constructor(
        private readonly routes: express.Router[],
        private readonly errorHandler: express.ErrorRequestHandler,
        private readonly logger: Logger,
        private readonly gatewayServerConfig: GatewayServerConfig
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private getGatewayHTTPServer(_apiSpecPath: string): express.Express {
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

export const GATEWAY_HTTP_SERVER_TOKEN = token<GatewayHTTPServer>("GatewayHTTPServer");

