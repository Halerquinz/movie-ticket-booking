import { ReadStream } from "fs";
import { Client } from "minio";
import { Logger } from "winston";
import { ErrorWithStatus } from "../../utils";
import { status } from "@grpc/grpc-js";

export interface BucketDM {
    createBucketIfNotExist(): Promise<void>;
    uploadFile(fileName: string, fileData: Buffer | ReadStream): Promise<void>;
    getFile(fileName: string): Promise<Buffer>;
    deleteFile(fileName: string): Promise<void>;
}

export class BucketDMImpl implements BucketDM {
    constructor(
        private readonly bucketName: string,
        private readonly minioClient: Client,
        private readonly logger: Logger
    ) { }

    public async createBucketIfNotExist(): Promise<void> {
        try {
            if (await this.minioClient.bucketExists(this.bucketName)) {
                return;
            }
        } catch (error) {
            this.logger.error("failed to check bucket's existence", { bucketName: this.bucketName, error });
            throw new ErrorWithStatus("failed to check bucket's existence", status.INTERNAL);
        }

        try {
            await this.minioClient.makeBucket(this.bucketName, "");
        } catch (error) {
            this.logger.error("failed to create bucket", { bucketName: this.bucketName, error });
            throw new ErrorWithStatus("failed to create bucket", status.INTERNAL);
        }
    }

    public async uploadFile(fileName: string, fileData: Buffer | ReadStream): Promise<void> {
        try {
            await this.minioClient.putObject(this.bucketName, fileName, fileData);
        } catch (error) {
            this.logger.error("failed to upload file", { bucketName: this.bucketName, fileName: fileName, error });
            throw new ErrorWithStatus("failed to upload file", status.INTERNAL);
        }
    }

    public async getFile(fileName: string): Promise<Buffer> {
        try {
            const objectStream = await this.minioClient.getObject(this.bucketName, fileName);
            const bufferArray = [];
            for await (const data of objectStream) {
                bufferArray.push(data);
            }
            return Buffer.concat(bufferArray);
        } catch (error) {
            this.logger.error("failed to get file", { bucketName: this.bucketName, fileName: fileName, error });
            throw new ErrorWithStatus("failed to get file", status.INTERNAL);
        }
    }

    public async deleteFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
        } catch (error) {
            this.logger.error("failed to delete file", { bucketName: this.bucketName, fileName: fileName, error });
            throw new ErrorWithStatus("failed to delete file", status.INTERNAL);
        }
    }
}