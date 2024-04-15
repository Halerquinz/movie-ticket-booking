import { token } from "brandi";

export class ApplicationConfig {
    public imageURLPrefix = "127.0.0.1:9000/images";
    public posterURLPrefix = "127.0.0.1:9000/posters";

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        if (process.env.GATEWAY_IMAGE_URL_PREFIX !== undefined) {
            config.imageURLPrefix = process.env.GATEWAY_IMAGE_URL_PREFIX;
        }
        if (process.env.GATEWAY_POSTER_URL_PREFIX !== undefined) {
            config.posterURLPrefix = process.env.GATEWAY_POSTER_URL_PREFIX;
        }
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN = token<ApplicationConfig>("ApplicationConfig");
