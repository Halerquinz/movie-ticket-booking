import { token } from "brandi";

export class ApplicationConfig {
    public checkoutTime = "35m"

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN = token<ApplicationConfig>("ApplicationConfig");
