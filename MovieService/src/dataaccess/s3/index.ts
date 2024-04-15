import { Container } from "brandi";
import { IMAGE_S3_DM_TOKEN, initializeImageS3DM } from "./image";
import { MINIO_CLIENT_TOKEN, newMinioClient } from "./minio";
import { POSTER_S3_DM_TOKEN, initializePosterS3DM } from "./poster";

export * from "./bucket_dm";
export * from "./image";
export * from "./poster";

export function bindToContainer(container: Container): void {
    container.bind(MINIO_CLIENT_TOKEN).toInstance(newMinioClient).inSingletonScope();
    container.bind(IMAGE_S3_DM_TOKEN).toInstance(initializeImageS3DM).inSingletonScope();
    container.bind(POSTER_S3_DM_TOKEN).toInstance(initializePosterS3DM).inSingletonScope();
}
