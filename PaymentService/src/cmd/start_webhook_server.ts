import { Container } from "brandi";
import * as config from "../config";
import * as elasticsearch from "../dataaccess/elasticsearch";
import * as utils from "../utils";
import * as db from "../dataaccess/db";
import * as kafka from "../dataaccess/kafka";
import * as service from "../service";
import * as payment from "../module/payment";
import * as paymentServiceProvider from "../payment-service-provider";
import dotenv from "dotenv";

export async function startWebhookServer(dotenvPath: string): Promise<void> {
    dotenv.config({
        path: dotenvPath
    });

    const container = new Container();
    config.bindToContainer(container);
    elasticsearch.bindToContainer(container);
    utils.bindToContainer(container);
    db.bindToContainer(container);
    kafka.bindToContainer(container);
    payment.bindToContainer(container);
    paymentServiceProvider.bindToContainer(container);
    service.bindToContainer(container);

    const webhookServer = container.get(service.WEBHOOK_HTTP_SERVER_TOKEN);
    webhookServer.start();
}