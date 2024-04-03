import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { MoviePoster } from "../schemas";

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

export class MoviePosterManagementOperatorImpl implements MoviePosterManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createPoster(ofMovieId: number, originalFileName: string, imageData: Buffer): Promise<MoviePoster> {
        const { error: createPosterError, response: createPosterResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createPoster.bind(this.movieServiceDM), {
            imageData,
            ofMovieId,
            originalFileName
        });

        if (createPosterError !== null) {
            this.logger.error("failed to call movie.createPoster()", { error: createPosterError });
            throw new ErrorWithHTTPCode(
                "failed to create poster",
                getHttpCodeFromGRPCStatus(createPosterError.code)
            );
        }

        return MoviePoster.fromProto(createPosterResponse?.moviePoster);
    }

    public async deletePoster(ofMovieId: number): Promise<void> {
        const { error: deletePosterError } = await promisifyGRPCCall(
            this.movieServiceDM.deletePoster.bind(this.movieServiceDM), { ofMovieId }
        );

        if (deletePosterError !== null) {
            this.logger.error("failed to call movie.deletePoster()", { error: deletePosterError });
            throw new ErrorWithHTTPCode(
                "failed to delete poster",
                getHttpCodeFromGRPCStatus(deletePosterError.code)
            );
        }
    }

    public async getPoster(movieId: number): Promise<MoviePoster | null> {
        const { error: getPosterError, response: createPosterResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getPoster.bind(this.movieServiceDM), {
            movieId
        });

        if (getPosterError !== null) {
            this.logger.error("failed to call movie.getPoster()", { error: getPosterError });
            throw new ErrorWithHTTPCode(
                "failed to get poster",
                getHttpCodeFromGRPCStatus(getPosterError.code)
            );
        }

        return MoviePoster.fromProto(createPosterResponse?.moviePoster);
    }
}

injected(
    MoviePosterManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN = token<MoviePosterManagementOperator>("MoviePosterManagementOperator");