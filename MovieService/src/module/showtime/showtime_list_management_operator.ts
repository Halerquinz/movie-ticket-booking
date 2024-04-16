import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    MOVIE_DATA_ACCESSOR_TOKEN,
    Movie,
    MovieDataAccessor,
    SCREEN_DATA_ACCESSOR_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    ScreenDataAccessor,
    Showtime,
    ShowtimeDataAccessor,
    THEATER_DATA_ACCESSOR_TOKEN,
    Theater,
    TheaterDataAccessor,
} from "../../dataaccess/db";
import { _ShowtimeType_Values } from "../../proto/gen/ShowtimeType";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";

export interface ShowtimeListManagementOperator {
    getShowtimeListOfTheater(theaterId: number, timeStart: number): Promise<any>;
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
        private readonly logger: Logger,
        private readonly showtimeDM: ShowtimeDataAccessor,
        private readonly movieDM: MovieDataAccessor,
        private readonly screenDM: ScreenDataAccessor,
        private readonly theaterDM: TheaterDataAccessor,
        private readonly timer: Timer
    ) { }

    public async getShowtimeListOfTheater(theaterId: number, timeStart: number): Promise<any> {

    }


    public async getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number
    ): Promise<{
        theater: Theater,
        movie: Movie,
        showtimeList: Showtime[] | undefined
    }> {
        requestTime = this.convertTimeTo0AMInTheSameDay(requestTime);

        const theater = await this.theaterDM.getTheaterById(theaterId);
        if (theater === null) {
            this.logger.error("no theater with theater id found", { theaterId: theaterId });
            throw new ErrorWithStatus(`no movie with theater id ${theater} found`, status.NOT_FOUND);
        }

        const movie = await this.movieDM.getMovieById(movieId);
        if (movie === null) {
            this.logger.error("no movie with movie id found", { movieId: movieId });
            throw new ErrorWithStatus(`no movie with movie id ${movieId} found`, status.NOT_FOUND);
        }
        const showtimeList = await this.showtimeDM.getShowtimeListOfTheaterByMovieIdInSameDay(theaterId, movieId, requestTime);

        return {
            movie, theater, showtimeList
        }
    }

    private convertTimeTo0AMInTheSameDay(requestTime: number): number {
        return new Date(requestTime).setHours(0, 0, 0, 0);
    }
}

injected(
    ShowtimeListManagementOperatorImpl,
    LOGGER_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    MOVIE_DATA_ACCESSOR_TOKEN,
    SCREEN_DATA_ACCESSOR_TOKEN,
    THEATER_DATA_ACCESSOR_TOKEN,
    TIMER_TOKEN
);

export const SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeListManagementOperator>("ShowtimeListManagementOperator");