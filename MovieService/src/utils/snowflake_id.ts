import { Snowflake } from "nodejs-snowflake";
import { DISTRIBUTED_CONFIG_TOKEN, DistributedConfig } from "../config";
import { injected, token } from "brandi";

export interface IdGenerator {
    generate(): Promise<number>;
}

export class SnowflakeIdGenerator implements IdGenerator {
    private readonly snowflake: Snowflake;

    constructor(distributedConfig: DistributedConfig) {
        this.snowflake = new Snowflake({ instance_id: distributedConfig.nodeId });
    }

    public async generate(): Promise<number> {
        return new Promise<number>((resolve) => {
            resolve(+this.snowflake.getUniqueID().toString(10));
        });
    }
}

injected(SnowflakeIdGenerator, DISTRIBUTED_CONFIG_TOKEN);

export const ID_GENERATOR_TOKEN = token<IdGenerator>("IdGenerator");