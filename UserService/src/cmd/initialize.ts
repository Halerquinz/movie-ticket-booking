import { Container } from "brandi";
import dotenv from "dotenv";
import * as utils from "../utils";
import * as config from "../config";
import * as cache from "../dataaccess/cache";
import * as db from "../dataaccess/db";
import * as elasticsearch from "../dataaccess/elasticsearch";
import * as password from "../module/password";
import * as permission from "../module/permission";
import * as role from "../module/role";
import * as token from "../module/token";
import * as user from "../module/user";
import * as jobs from "../jobs";

export async function initialize(dotenvPath: string): Promise<void> {
    dotenv.config({
        path: dotenvPath,
    });

    const container = new Container();
    utils.bindToContainer(container);
    config.bindToContainer(container);
    cache.bindToContainer(container);
    db.bindToContainer(container);
    elasticsearch.bindToContainer(container);
    await token.bindToContainer(container);
    password.bindToContainer(container);
    permission.bindToContainer(container);
    role.bindToContainer(container);
    user.bindToContainer(container);
    jobs.bindToContainer(container);

    const initializationJob = container.get(jobs.INITIALIZATION_JOB_TOKEN);
    initializationJob.execute().then(() => {
        process.exit();
    });
}
