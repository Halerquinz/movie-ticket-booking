import { Container } from "brandi";
import * as config from "../config";
import * as db from "../dataaccess/db";
import * as cache from "../dataaccess/cache";
import * as service from "../service";
import * as utils from "../utils";
import * as user from "../module/user";
import * as token from "../module/token";
import * as password from "../module/password";
import dotenv from "dotenv";

export async function startGRPCServer(dotenvPath: string): Promise<void> {
    dotenv.config({
        path: dotenvPath
    });

    const container = new Container();
    config.bindToContainer(container);
    db.bindToContainer(container);
    cache.bindToContainer(container);
    user.bindToContainer(container);
    service.bindToContainer(container);
    utils.bindToContainer(container);
    await token.bindToContainer(container);
    password.bindToContainer(container);

    const server = container.get(service.USER_SERVICE_GRPC_SERVER_TOKEN);
    server.loadProtoAndStartServer("./src/proto/service/user_service.proto");
}