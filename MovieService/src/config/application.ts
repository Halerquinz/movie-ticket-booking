import { token } from "brandi";

export class ApplicationConfig {
    public originalImageDir = "originals";
    public thumbnailImageDir = "thumbnails";

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        if (process.env.MOVIE_SERVICE_ORIGINAL_IMAGE_DIR !== undefined) {
            config.originalImageDir =
                process.env.MOVIE_SERVICE_ORIGINAL_IMAGE_DIR;
        }
        if (process.env.MOVIE_SERVICE_THUMBNAIL_IMAGE_DIR !== undefined) {
            config.thumbnailImageDir =
                process.env.MOVIE_SERVICE_THUMBNAIL_IMAGE_DIR;
        }
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN =
    token<ApplicationConfig>("ApplicationConfig");
