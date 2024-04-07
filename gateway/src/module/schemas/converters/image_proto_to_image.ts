import { injected, token } from "brandi";
import httpStatus from "http-status";
import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../../config";
import { MovieImage as MovieImageProto } from "../../../proto/gen/MovieImage";
import { ErrorWithHTTPCode, LOGGER_TOKEN } from "../../../utils";
import { MovieImage } from "../movie_image";

export interface ImageProtoToImageConverter {
    convert(movieImageProto: MovieImageProto | undefined): Promise<MovieImage>;
}

export class ImageProtoToImageConverterImpl implements ImageProtoToImageConverter {
    constructor(
        private readonly applicationConfig: ApplicationConfig,
        private readonly logger: Logger
    ) { }

    public async convert(movieImageProto: MovieImageProto | undefined): Promise<MovieImage> {
        const imageId = movieImageProto?.imageId || 0;
        if (movieImageProto?.ofMovieId === undefined) {
            this.logger.error("image has no movie", { imageId });
            throw new ErrorWithHTTPCode(
                "image has no movie",
                httpStatus.INTERNAL_SERVER_ERROR
            );
        }

        const originalFileName = movieImageProto?.originalFileName || "";

        const originalImageFileURL = this.getOriginalImageFileURL(
            movieImageProto?.originalImageFileName || ""
        );
        const thumbnailImageFileURL = this.getThumbnailImageFileURL(
            movieImageProto?.thumbnailImageFileName || ""
        );

        return new MovieImage(
            imageId,
            +movieImageProto.ofMovieId,
            originalFileName,
            originalImageFileURL,
            thumbnailImageFileURL
        );
    }

    private getOriginalImageFileURL(originalImageFilename: string): string {
        return `/${this.applicationConfig.originalImageURLPrefix}/${originalImageFilename}`;
    }

    private getThumbnailImageFileURL(thumbnailFilename: string): string {
        return `/${this.applicationConfig.thumbnailImageURLPrefix}/${thumbnailFilename}`;
    }
}

injected(
    ImageProtoToImageConverterImpl,
    APPLICATION_CONFIG_TOKEN,
    LOGGER_TOKEN
);

export const IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN = token<ImageProtoToImageConverter>("ImageProtoToImageConverter");
