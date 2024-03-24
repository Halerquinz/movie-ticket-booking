import { Container } from "brandi";
import dotenv from "dotenv";
import * as service from "../service";
import * as config from "../config";
import * as modules from "../module";
import * as utils from "../utils";
import * as grpc from "../dataaccess/grpc";
import * as elasticsearch from "../dataaccess/elasticsearch";


export function startHTTPServer(dotEnvPath: string) {
    dotenv.config({ path: dotEnvPath });

    const container = new Container();
    config.bindToContainer(container);
    service.bindToContainer(container);
    modules.bindToContainer(container);
    utils.bindToContainer(container);
    grpc.bindToContainer(container);
    elasticsearch.bindToContainer(container);

    const server = container.get(service.GATEWAY_HTTP_SERVER_TOKEN);
    server.loadApiDefinitionAndStart("/");
}