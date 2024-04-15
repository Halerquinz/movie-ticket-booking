import { injected, token } from "brandi";
import { Client } from "minio";
import { Logger } from "winston";
import { S3Config, S3_CONFIG_TOKEN } from "../../config";
import { LOGGER_TOKEN } from "../../utils";
import { BucketDMImpl } from "./bucket_dm";
import { MINIO_CLIENT_TOKEN } from "./minio";

export function initializeImageS3DM(minioClient: Client, logger: Logger, s3Config: S3Config): BucketDMImpl {
    return new BucketDMImpl(s3Config.imageBucket, minioClient, logger);
}

injected(initializeImageS3DM, MINIO_CLIENT_TOKEN, LOGGER_TOKEN, S3_CONFIG_TOKEN);

export const IMAGE_S3_DM_TOKEN = token<BucketDMImpl>("ImageS3DM");
