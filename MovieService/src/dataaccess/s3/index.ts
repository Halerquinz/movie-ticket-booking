import { Container } from "brandi";
import { MINIO_CLIENT_TOKEN, newMinioClient } from "./minio";
import { initializeOriginalImageS3DM, ORIGINAL_IMAGE_S3_DM_TOKEN } from "./original_image";
import { initializeThumbnailImageS3DM, THUMBNAIL_IMAGE_S3_DM_TOKEN } from "./thumbnail_image";

export * from "./bucket_dm";
export * from "./original_image";
export * from "./thumbnail_image";

export function bindToContainer(container: Container): void {
    container.bind(MINIO_CLIENT_TOKEN).toInstance(newMinioClient).inSingletonScope();
    container.bind(ORIGINAL_IMAGE_S3_DM_TOKEN).toInstance(initializeOriginalImageS3DM).inSingletonScope();
    container.bind(THUMBNAIL_IMAGE_S3_DM_TOKEN).toInstance(initializeThumbnailImageS3DM).inSingletonScope();
}
