import { token } from "brandi";

export class S3Config {
    public host = "127.0.0.1";
    public port = 9000;
    public user = "minioadmin";
    public password = "minioadmin";
    public originalImageBucket = "originals";
    public thumbnailImageBucket = "thumbnails";

    public static fromEnv(): S3Config {
        const config = new S3Config();
        if (process.env.S3_HOST !== undefined) {
            config.host = process.env.S3_HOST;
        }
        if (process.env.S3_PORT !== undefined) {
            config.port = +process.env.S3_PORT;
        }
        if (process.env.S3_USER !== undefined) {
            config.user = process.env.S3_USER;
        }
        if (process.env.S3_PASSWORD !== undefined) {
            config.password = process.env.S3_PASSWORD;
        }
        if (process.env.S3_ORIGINAL_IMAGE_BUCKET !== undefined) {
            config.originalImageBucket = process.env.S3_ORIGINAL_IMAGE_BUCKET;
        }
        if (process.env.S3_THUMBNAIL_IMAGE_BUCKET !== undefined) {
            config.thumbnailImageBucket = process.env.S3_THUMBNAIL_IMAGE_BUCKET;
        }
        return config;
    }
}

export const S3_CONFIG_TOKEN = token<S3Config>("S3Config");
