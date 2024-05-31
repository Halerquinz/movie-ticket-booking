import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import { MOVIE_DATA_ACCESSOR_TOKEN, MOVIE_POSTER_DATA_ACCESSOR_TOKEN, MovieDataAccessor, MoviePoster, MoviePosterDataAccessor } from "../../dataaccess/db";
import { BucketDM, POSTER_S3_DM_TOKEN } from "../../dataaccess/s3";
import { ErrorWithStatus, ID_GENERATOR_TOKEN, IdGenerator, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { IMAGE_PROCESSOR_TOKEN, ImageProcessor } from "./image_processor";

export interface MoviePosterOperator {
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

export class MoviePosterOperatorImpl implements MoviePosterOperator {
    constructor(
        private readonly movieDM: MovieDataAccessor,
        private readonly moviePosterDM: MoviePosterDataAccessor,
        private readonly imageProcessor: ImageProcessor,
        private readonly posterS3DM: BucketDM,
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
    }> {
        const posterRecord = await this.moviePosterDM.getMoviePosterByMovieId(ofMovieId);
        if (posterRecord !== null) {
            this.logger.error("movie already have poster", {
                ofMovieId
            });
            throw new ErrorWithStatus(`movie already have poster with movie_id ${ofMovieId}`, status.ALREADY_EXISTS);
        }

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
                    .then((resizedBuffer) => this.posterS3DM.uploadFile(originalImageFileName, resizedBuffer)),
            ]);
        } catch (error) {
            this.logger.error("failed to save image files", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        const uploadedImage = await this.moviePosterDM.withTransaction(async (moviePosterDM) => {
            const uploadedOfMovieId = await moviePosterDM.createMoviePoster({
                ofMovieId: movie.id,
                originalFileName: originalFileName,
                originalImageFileName: originalImageFileName,
            });

            return {
                ofMovieId: uploadedOfMovieId,
                originalFileName: originalFileName,
                originalImageFileName: originalImageFileName,
            };
        });

        return uploadedImage;
    }

    public async getPoster(movieId: number): Promise<MoviePoster | null> {
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
        return `movie-poster-${uploadTime}-${await this.idGenerator.generate()}.jpeg`;
    }
}

injected(
    MoviePosterOperatorImpl,
    MOVIE_DATA_ACCESSOR_TOKEN,
    MOVIE_POSTER_DATA_ACCESSOR_TOKEN,
    IMAGE_PROCESSOR_TOKEN,
    POSTER_S3_DM_TOKEN,
    LOGGER_TOKEN,
    ID_GENERATOR_TOKEN,
    TIMER_TOKEN,
);

export const MOVIE_POSTER_OPERATOR_TOKEN = token<MoviePosterOperator>("MoviePosterOperator");
