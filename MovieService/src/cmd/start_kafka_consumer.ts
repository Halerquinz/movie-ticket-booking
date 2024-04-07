import { Container } from "brandi";
import * as config from "../config";
import * as db from "../dataaccess/db";
import * as elasticsearch from "../dataaccess/elasticsearch";
import * as s3 from "../dataaccess/s3";
import * as kafka from "../dataaccess/kafka";
import * as modules from "../module";
import * as service from "../service";
import * as utils from "../utils";
import * as consumer from "../consumer";
import dotenv from "dotenv";

export async function startKafkaConsumer(dotenvPath: string): Promise<void> {
    dotenv.config({
        path: dotenvPath
    });

    const container = new Container();
    config.bindToContainer(container);
    db.bindToContainer(container);
    elasticsearch.bindToContainer(container);
    s3.bindToContainer(container);
    kafka.bindToContainer(container);
    modules.bindToContainer(container);
    utils.bindToContainer(container);
    service.bindToContainer(container);
    consumer.bindToContainer(container);

    const kafkaConsumer = container.get(consumer.MOVIE_SERVICE_KAFKA_CONSUMER_TOKEN);

    kafkaConsumer.start();
}
