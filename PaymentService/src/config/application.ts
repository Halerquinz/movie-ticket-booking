import { token } from "brandi";

export class ApplicationConfig {

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN = token<ApplicationConfig>("ApplicationConfig");
