import { Container } from "brandi";
import * as config from "../config";
import * as db from "../dataaccess/db";
import * as elasticsearch from "../dataaccess/elasticsearch";
import * as s3 from "../dataaccess/s3";
import * as kafka from "../dataaccess/kafka";
import * as modules from "../module";
import * as jobs from "../jobs";
import * as utils from "../utils";
import dotenv from "dotenv";

export async function initialize(dotenvPath: string): Promise<void> {
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

    jobs.bindToContainer(container);

    const initializationJob = container.get(jobs.INITIALIZATION_JOB_TOKEN);
    initializationJob.execute().then(() => {
        process.exit();
    });
}
