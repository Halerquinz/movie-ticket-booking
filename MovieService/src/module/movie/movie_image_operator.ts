import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import { MOVIE_DATA_ACCESSOR_TOKEN, MOVIE_IMAGE_DATA_ACCESSOR_TOKEN, MovieDataAccessor, MovieImage, MovieImageDataAccessor } from "../../dataaccess/db";
import { BucketDM, IMAGE_S3_DM_TOKEN } from "../../dataaccess/s3";
import { ErrorWithStatus, ID_GENERATOR_TOKEN, IdGenerator, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { IMAGE_PROCESSOR_TOKEN, ImageProcessor } from "./image_processor";

export interface MovieImageOperator {
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

const ORIGINAL_WIDTH = 1920;
const ORIGINAL_HEIGHT = 1080;

export class MovieImageOperatorImpl implements MovieImageOperator {
    constructor(
        private readonly movieDM: MovieDataAccessor,
        private readonly movieImageDM: MovieImageDataAccessor,
        private readonly imageProcessor: ImageProcessor,
        private readonly imageS3DM: BucketDM,
        private readonly logger: Logger,
        private readonly idGenerator: IdGenerator,
        private readonly timer: Timer,
    ) { }

    public async createImage(
        ofMovieId: number,
        originalFileName: string,
        imageData: Buffer,
    ): Promise<MovieImage> {
        originalFileName = this.sanitizeOriginalFileName(originalFileName);

        if (!this.isValidOriginalFileName(originalFileName)) {
            this.logger.error("invalid original file name", {
                originalFileName,
            });
            throw new ErrorWithStatus(`invalid original file name ${originalFileName}`, status.INVALID_ARGUMENT);
        }

        const movie = await this.movieDM.getMovieById(ofMovieId);
        if (movie === null) {
            this.logger.error("movie with movie id not found", { ofMovieId });
            throw new ErrorWithStatus(`movie with movie id ${ofMovieId} not found`, status.NOT_FOUND);
        }

        const uploadTime = this.timer.getCurrentTime();
        const originalImageFileName = await this.generateOriginalImageFilename(uploadTime);

        try {
            Promise.all([
                this.imageProcessor
                    .resizeImage(imageData, ORIGINAL_WIDTH, ORIGINAL_HEIGHT)
                    .then((resizedBuffer) => this.imageS3DM.uploadFile(originalImageFileName, resizedBuffer)),
            ])
        } catch (error) {
            this.logger.error("failed to save image files", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        const uploadedImage = await this.movieImageDM.withTransaction(async (movieImageDM) => {
            const uploadedImageId = await movieImageDM.createMovieImage({
                ofMovieId: movie.id,
                originalFileName: originalFileName,
                originalImageFileName: originalImageFileName,
            });

            return {
                id: uploadedImageId,
                ofMovieId: movie.id,
                originalFileName: originalFileName,
                originalImageFileName: originalImageFileName,
            };
        });

        return uploadedImage;
    }

    public async getImage(movieId: number): Promise<MovieImage[]> {
        return await this.movieImageDM.getMovieImage(movieId);
    }

    public async deleteImage(id: number): Promise<void> {
        return this.movieImageDM.deleteMovieImage(id);
    }

    private sanitizeOriginalFileName(originalFileName: string): string {
        return validator.escape(validator.trim(originalFileName));
    }

    private isValidOriginalFileName(originalFileName: string): boolean {
        return validator.isLength(originalFileName, { max: 256 });
    }

    private async generateOriginalImageFilename(uploadTime: number): Promise<string> {
        return `movie-image-${uploadTime}-${await this.idGenerator.generate()}.jpeg`;
    }
}

injected(
    MovieImageOperatorImpl,
    MOVIE_DATA_ACCESSOR_TOKEN,
    MOVIE_IMAGE_DATA_ACCESSOR_TOKEN,
    IMAGE_PROCESSOR_TOKEN,
    IMAGE_S3_DM_TOKEN,
    LOGGER_TOKEN,
    ID_GENERATOR_TOKEN,
    TIMER_TOKEN,
);

export const MOVIE_IMAGE_OPERATOR_TOKEN = token<MovieImageOperator>("MovieImageOperator");
