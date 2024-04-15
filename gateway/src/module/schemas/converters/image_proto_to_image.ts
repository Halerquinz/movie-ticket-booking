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
        const imageId = movieImageProto?.id || 0;
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


        return new MovieImage(
            imageId,
            +movieImageProto.ofMovieId,
            originalFileName,
            originalImageFileURL,
        );
    }

    private getOriginalImageFileURL(originalImageFilename: string): string {
        return `http://${this.applicationConfig.imageURLPrefix}/${originalImageFilename}`;
    }
}

injected(
    ImageProtoToImageConverterImpl,
    APPLICATION_CONFIG_TOKEN,
    LOGGER_TOKEN
);

export const IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN = token<ImageProtoToImageConverter>("ImageProtoToImageConverter");
