import { injected, token } from "brandi";
import { Client } from "minio";
import { S3Config, S3_CONFIG_TOKEN } from "../../config";

export function newMinioClient(s3Config: S3Config): Client {
    return new Client({
        endPoint: s3Config.host,
        port: s3Config.port,
        accessKey: s3Config.user,
        secretKey: s3Config.password,
        useSSL: false,
    });
}

injected(newMinioClient, S3_CONFIG_TOKEN);

export const MINIO_CLIENT_TOKEN = token<Client>("Client");
