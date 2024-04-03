import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import { MOVIE_DATA_ACCESSOR_TOKEN, MOVIE_POSTER_DATA_ACCESSOR_TOKEN, MovieDataAccessor, MoviePosterDataAccessor } from "../../dataaccess/db";
import { BucketDM, ORIGINAL_IMAGE_S3_DM_TOKEN, THUMBNAIL_IMAGE_S3_DM_TOKEN } from "../../dataaccess/s3";
import { ErrorWithStatus, ID_GENERATOR_TOKEN, IdGenerator, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { IMAGE_PROCESSOR_TOKEN, ImageProcessor } from "./image_processor";
import { MoviePoster } from "../../proto/gen/MoviePoster";

export interface MoviePosterManagementOperator {
    createPoster(
        ofMovieId: number,
        originalFileName: string,
        imageData: Buffer,
    ): Promise<MoviePoster>;
    getPoster(
        movieId: number
    ): Promise<MoviePoster | null>;
    deletePoster(ofMovieId: number): Promise<void>;
}

const ORIGINAL_WIDTH = 1920;
const ORIGINAL_HEIGHT = 1080;
const THUMBNAIL_WIDTH = 320;
const THUMBNAIL_HEIGHT = 180;

export class MoviePosterManagementOperatorImpl implements MoviePosterManagementOperator {
    constructor(
        private readonly movieDM: MovieDataAccessor,
        private readonly moviePosterDM: MoviePosterDataAccessor,
        private readonly imageProcessor: ImageProcessor,
        private readonly originalImageS3DM: BucketDM,
        private readonly thumbnailImageS3DM: BucketDM,
        private readonly logger: Logger,
        private readonly idGenerator: IdGenerator,
        private readonly timer: Timer,
    ) { }

    public async createPoster(
        ofMovieId: number,
        originalFileName: string,
        imageData: Buffer,
    ): Promise<{
        ofMovieId: number,
        originalFileName: string,
        originalImageFileName: string,
        thumbnailImageFileName: string
    }> {

        originalFileName = this.sanitizeOriginalFileName(originalFileName);

        if (!this.isValidOriginalFileName(originalFileName)) {
            this.logger.error("invalid original file name", {
                originalFileName,
            });
            throw new ErrorWithStatus(`invalid original file name ${originalFileName}`, status.INVALID_ARGUMENT);
        }

        const movie = await this.movieDM.getMovie(ofMovieId);
        if (movie === null) {
            this.logger.error("movie with movie id not found", { ofMovieId });
            throw new ErrorWithStatus(`movie with movie id ${ofMovieId} not found`, status.NOT_FOUND);
        }

        const uploadTime = this.timer.getCurrentTime();
        const originalImageFileName = await this.generateOriginalImageFilename(uploadTime);
        const thumbnailImageFileName = await this.generateThumbnailImageFilename(uploadTime);

        try {
            Promise.all([
                this.imageProcessor
                    .resizeImage(imageData, ORIGINAL_WIDTH, ORIGINAL_HEIGHT)
                    .then((resizedBuffer) => this.originalImageS3DM.uploadFile(originalImageFileName, resizedBuffer)),
                this.imageProcessor
                    .resizeImage(imageData, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
                    .then((resizedBuffer) => this.thumbnailImageS3DM.uploadFile(thumbnailImageFileName, resizedBuffer)),
            ])
        } catch (error) {
            this.logger.error("failed to save image files", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        const uploadedImage = await this.moviePosterDM.withTransaction(async (movieImageDM) => {
            const uploadedOfMovieId = await movieImageDM.createMoviePoster({
                ofMovieId: movie.movieId,
                originalFileName: originalFileName,
                originalImageFileName: originalImageFileName,
                thumbnailImageFileName: thumbnailImageFileName,
            });

            return {
                ofMovieId: uploadedOfMovieId,
                originalFileName: originalFileName,
                originalImageFileName: originalImageFileName,
                thumbnailImageFileName: thumbnailImageFileName,
            };
        });

        return uploadedImage;
    }

    public async getPoster(movieId: number): Promise<{
        ofMovieId: number;
        originalFileName: string;
        originalImageFileName: string;
        thumbnailImageFileName: string;
    } | null> {
        return await this.moviePosterDM.getMoviePosterByMovieId(movieId);
    }

    public async deletePoster(ofMovieId: number): Promise<void> {
        return this.moviePosterDM.deleteMoviePoster(ofMovieId);
    }

    private sanitizeOriginalFileName(originalFileName: string): string {
        return validator.escape(validator.trim(originalFileName));
    }

    private isValidOriginalFileName(originalFileName: string): boolean {
        return validator.isLength(originalFileName, { max: 256 });
    }

    private async generateOriginalImageFilename(uploadTime: number): Promise<string> {
        return `original-${uploadTime}-${await this.idGenerator.generate()}.jpeg`;
    }

    private async generateThumbnailImageFilename(uploadTime: number): Promise<string> {
        return `thumbnail-${uploadTime}-${await this.idGenerator.generate()}.jpeg`;
    }
}

injected(
    MoviePosterManagementOperatorImpl,
    MOVIE_DATA_ACCESSOR_TOKEN,
    MOVIE_POSTER_DATA_ACCESSOR_TOKEN,
    IMAGE_PROCESSOR_TOKEN,
    ORIGINAL_IMAGE_S3_DM_TOKEN,
    THUMBNAIL_IMAGE_S3_DM_TOKEN,
    LOGGER_TOKEN,
    ID_GENERATOR_TOKEN,
    TIMER_TOKEN,
);

export const MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN = token<MoviePosterManagementOperator>("MoviePosterManagementOperator");
