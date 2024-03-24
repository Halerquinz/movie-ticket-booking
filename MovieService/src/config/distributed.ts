import { token } from "brandi";

export class DistributedConfig {
    public nodeId = 0;

    public static fromEnv(): DistributedConfig {
        const config = new DistributedConfig();
        if (process.env.NODE_ID !== undefined) {
            config.nodeId = +process.env.NODE_ID;
        }
        return config;
    }
}

export const DISTRIBUTED_CONFIG_TOKEN =
    token<DistributedConfig>("DistributedConfig");
