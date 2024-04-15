import { token } from "brandi";

export class S3Config {
    public host = "127.0.0.1";
    public port = 9000;
    public user = "ROOTUSER";
    public password = "CHANGEME123";
    public imageBucket = "images";
    public posterBucket = "posters";

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
        if (process.env.S3_IMAGE_BUCKET !== undefined) {
            config.imageBucket = process.env.S3_IMAGE_BUCKET;
        }
        if (process.env.S3_POSTER_BUCKET !== undefined) {
            config.posterBucket = process.env.S3_POSTER_BUCKET;
        }
        return config;
    }
}

export const S3_CONFIG_TOKEN = token<S3Config>("S3Config");
