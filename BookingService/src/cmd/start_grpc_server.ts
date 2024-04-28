import { Container } from "brandi";
import * as config from "../config";
import * as elasticsearch from "../dataaccess/elasticsearch";
import * as db from "../dataaccess/db";
import * as grpc from "../dataaccess/grpc";
import * as bull from "../dataaccess/bull";
import * as utils from "../utils";
import * as booking from "../module/booking";
import * as worker from "../worker";
import * as service from "../service";
import * as kafka from "../dataaccess/kafka";
import * as consumer from "../consumer";
import dotenv from "dotenv";

export function startGRPCServer(dotenvPath: string): void {
    dotenv.config({
        path: dotenvPath
    });

    const container = new Container();
    config.bindToContainer(container);
    elasticsearch.bindToContainer(container);
    utils.bindToContainer(container);
    db.bindToContainer(container);
    kafka.bindToContainer(container);
    grpc.bindToContainer(container);
    bull.bindToContainer(container);
    booking.bindToContainer(container);
    worker.bindToContainer(container);
    service.bindToContainer(container);

    const server = container.get(service.BOOKING_SERVICE_GRPC_SERVER_TOKEN);
    server.loadProtoAndStartServer("./src/proto/service/booking_service.proto");
}