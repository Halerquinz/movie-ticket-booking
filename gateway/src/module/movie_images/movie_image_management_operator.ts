import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { MovieImage } from "../schemas";
import { IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN, ImageProtoToImageConverter } from "../schemas/converters";

export interface MovieImageManagementOperator {
    createImage(
        ofMovieId: number,
        originalFileName: string,
        imageData: Buffer,
    ): Promise<MovieImage>;
    getImage(
        movieId: number
    ): Promise<MovieImage[]>;
    deleteImage(id: number): Promise<void>;
}

export class MovieImageManagementOperatorImpl implements MovieImageManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
        private readonly imageProtoToImageConverter: ImageProtoToImageConverter,
    ) { }

    public async createImage(ofMovieId: number, originalFileName: string, imageData: Buffer): Promise<MovieImage> {
        const { error: createImageError, response: createImageResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createImage.bind(this.movieServiceDM), {
            imageData,
            ofMovieId,
            originalFileName
        });

        if (createImageError !== null) {
            this.logger.error("failed to call movie.createImage()", { error: createImageError });
            throw new ErrorWithHTTPCode(
                "failed to create movie image",
                getHttpCodeFromGRPCStatus(createImageError.code)
            );
        }

        return this.imageProtoToImageConverter.convert(createImageResponse?.movieImage);
    }

    public async deleteImage(id: number): Promise<void> {
        const { error: deleteImageError } = await promisifyGRPCCall(
            this.movieServiceDM.deleteImage.bind(this.movieServiceDM), { id }
        );

        if (deleteImageError !== null) {
            this.logger.error("failed to call movie.deleteImage()", { error: deleteImageError });
            throw new ErrorWithHTTPCode(
                "failed to delete image",
                getHttpCodeFromGRPCStatus(deleteImageError.code)
            );
        }
    }

    public async getImage(movieId: number): Promise<MovieImage[]> {
        const { error: getImageError, response: createImageResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getImage.bind(this.movieServiceDM), {
            movieId
        });

        if (getImageError !== null) {
            this.logger.error("failed to call movie.getImage()", { error: getImageError });
            throw new ErrorWithHTTPCode(
                "failed to get image",
                getHttpCodeFromGRPCStatus(getImageError.code)
            );
        }

        const movieImageProtoList = createImageResponse?.movieImageList || [];

        const movieImageList = await Promise.all(
            movieImageProtoList.map((movieImageProto) => this.imageProtoToImageConverter.convert(movieImageProto))
        )

        return movieImageList;
    }
}

injected(
    MovieImageManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN,
    IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN
);

export const MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN = token<MovieImageManagementOperatorImpl>("MovieImageManagementOperator");