import { Container } from "brandi";
import * as config from "../config";
import * as elasticsearch from "../dataaccess/elasticsearch";
import * as utils from "../utils";
import dotenv from "dotenv";

export async function startGRPCServer(dotenvPath: string): Promise<void> {
    dotenv.config({
        path: dotenvPath
    });

    const container = new Container();
    config.bindToContainer(container);
    elasticsearch.bindToContainer(container);
    utils.bindToContainer(container);
}