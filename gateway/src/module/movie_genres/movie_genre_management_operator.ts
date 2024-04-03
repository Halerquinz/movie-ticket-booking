import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { MovieGenre } from "../schemas";

export interface MovieGenreManagementOperator {
    createMovieGenre(displayName: string): Promise<MovieGenre>;
    updateMovieGenre(id: number, displayName: string): Promise<MovieGenre>;
    deleteMovieGenre(id: number): Promise<void>;
}

export class MovieGenreManagementOperatorImpl implements MovieGenreManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createMovieGenre(displayName: string): Promise<MovieGenre> {
        const { error: createMovieGenreError, response: createMovieGenreResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createMovieGenre.bind(this.movieServiceDM), {
            displayName
        });

        if (createMovieGenreError !== null) {
            this.logger.error("failed to call movie.createMovieGenre()", { error: createMovieGenreError });
            throw new ErrorWithHTTPCode(
                "failed to create movie genre",
                getHttpCodeFromGRPCStatus(createMovieGenreError.code)
            );
        }

        return MovieGenre.fromProto(createMovieGenreResponse?.movieGenre);
    }

    public async deleteMovieGenre(id: number): Promise<void> {
        const { error: deleteMovieGenreError } = await promisifyGRPCCall(
            this.movieServiceDM.deleteMovieGenre.bind(this.movieServiceDM), { id }
        );

        if (deleteMovieGenreError !== null) {
            this.logger.error("failed to call movie.deleteMovieGenre()", { error: deleteMovieGenreError });
            throw new ErrorWithHTTPCode(
                "failed to delete movie genre",
                getHttpCodeFromGRPCStatus(deleteMovieGenreError.code)
            );
        }
    }

    public async updateMovieGenre(id: number, displayName: string): Promise<MovieGenre> {
        const { error: updateMovieGenreError, response: updateMovieGenreResponse } = await promisifyGRPCCall(
            this.movieServiceDM.updateMovieGenre.bind(this.movieServiceDM),
            { displayName, id }
        );

        if (updateMovieGenreError !== null) {
            this.logger.error("failed to call movie_service.updateMovieGenre()", { error: updateMovieGenreError });
            throw new ErrorWithHTTPCode("failed to update movie genre info", getHttpCodeFromGRPCStatus(updateMovieGenreError.code));
        }

        return MovieGenre.fromProto(updateMovieGenreResponse?.movieGenre);
    }
}

injected(
    MovieGenreManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const MOVIE_GENRE_MANAGEMENT_OPERATOR_TOKEN = token<MovieGenreManagementOperatorImpl>("MovieGenreManagementOperator");