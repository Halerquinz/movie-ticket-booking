import { injected, token } from "brandi";
import sharp from "sharp";

export interface ImageProcessor {
    resizeImage(imageData: Buffer, minWidth: number, minHeigh: number): Promise<Buffer>;
}

export class ImageProcessorImpl implements ImageProcessor {
    public async resizeImage(imageData: Buffer, minWidth: number, minHeigh: number): Promise<Buffer> {
        let image = sharp(imageData);
        const imageMetadata = await image.metadata();
        if (this.checkImageNeedResizing(imageMetadata.width || 0, imageMetadata.height || 0, minWidth, minHeigh)) {
            image = image.resize(minWidth, minHeigh, { fit: "outside" });
        }
        return image.rotate().toBuffer();
    }

    private checkImageNeedResizing(
        imageWidth: number,
        imageHeight: number,
        minWidth: number,
        minHeight: number
    ): boolean {
        if (imageWidth < minWidth) return false;
        if (imageHeight < minHeight) return false;
        return true;
    }
}

injected(ImageProcessorImpl);

export const IMAGE_PROCESSOR_TOKEN = token<ImageProcessor>("ImageProcessor");
