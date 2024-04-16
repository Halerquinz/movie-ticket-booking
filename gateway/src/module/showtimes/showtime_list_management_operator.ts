import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Movie, Showtime, Theater } from "../schemas";

export interface ShowtimeListManagementOperator {
    getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number
    ): Promise<{
        theater: Theater,
        movie: Movie,
        showtimeList: Showtime[] | undefined
    }>
}

export class ShowtimeListManagementOperatorImpl implements ShowtimeListManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number
    ): Promise<{
        theater: Theater;
        movie: Movie;
        showtimeList: Showtime[] | undefined;
    }> {
        const { error: getShowtimeListOfTheaterByMovieIdError, response: getShowtimeListOfTheaterByMovieIdResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getShowtimeListOfTheaterByMovieId.bind(this.movieServiceDM),
            { movieId, requestTime, theaterId }
        );

        if (getShowtimeListOfTheaterByMovieIdError !== null) {
            this.logger.error("failed to call movie_service.getShowtimeListOfTheaterByMovieId()", { error: getShowtimeListOfTheaterByMovieIdError });
            throw new ErrorWithHTTPCode("failed to get showtime list of theater by movie id", getHttpCodeFromGRPCStatus(getShowtimeListOfTheaterByMovieIdError.code));
        }

        const theater = Theater.fromProto(getShowtimeListOfTheaterByMovieIdResponse?.theater);
        const movie = Movie.fromProto(getShowtimeListOfTheaterByMovieIdResponse?.movie);
        const showtimeList = getShowtimeListOfTheaterByMovieIdResponse?.showtimeList?.map((showtime) => Showtime.fromProto(showtime));

        return {
            movie,
            showtimeList,
            theater
        }
    }
}

injected(
    ShowtimeListManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeListManagementOperatorImpl>("ShowtimeListManagementOperator");