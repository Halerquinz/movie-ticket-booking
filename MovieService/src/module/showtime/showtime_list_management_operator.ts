import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    MOVIE_DATA_ACCESSOR_TOKEN,
    MovieDataAccessor,
    MovieTypeDataAccessor,
    SCREEN_DATA_ACCESSOR_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    ScreenDataAccessor,
    Showtime,
    ShowtimeDataAccessor,
    THEATER_DATA_ACCESSOR_TOKEN,
    Theater,
    TheaterDataAccessor
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import ms from "ms";
import { ShowtimeDetail } from "../../proto/gen/ShowtimeDetail";

export interface ShowtimeListManagementOperator {
    getShowtimeListOfTheater(
        theaterId: number,
        requestTime: number
    ): Promise<{
        theater: Theater,
        showtimeListOfTheater: ShowtimeDetail[];
    }>;
    getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number
    ): Promise<{
        theater: Theater,
        showtimeListOfTheater: ShowtimeDetail[];
    }>;
}

export class ShowtimeListManagementOperatorImpl implements ShowtimeListManagementOperator {
    private readonly showtimeRangeInMS: number;

    constructor(
        private readonly logger: Logger,
        private readonly showtimeDM: ShowtimeDataAccessor,
        private readonly movieDM: MovieDataAccessor,
        private readonly screenDM: ScreenDataAccessor,
        private readonly theaterDM: TheaterDataAccessor,
        private readonly timer: Timer
    ) {
        this.showtimeRangeInMS = ms("1d");
    }

    public async getShowtimeListOfTheater(theaterId: number, requestTime: number): Promise<{
        theater: Theater;
        showtimeListOfTheater: ShowtimeDetail[];
    }> {
        if (!this.isValidDate(requestTime)) {
            this.logger.error("invalid date", { requestTime });
            requestTime = this.timer.getCurrentTime();
        }
        requestTime = this.convertTimeTo0AMInTheSameDay(requestTime);

        const theaterRecord = await this.theaterDM.getTheaterById(theaterId);
        if (theaterRecord === null) {
            this.logger.error("no theater with theater id found", { theaterId: theaterId });
            throw new ErrorWithStatus(`no movie with theater id ${theaterRecord} found`, status.NOT_FOUND);
        }

        const showtimeList = await this.showtimeDM.getShowtimeListOfTheaterId(theaterId, requestTime, this.showtimeRangeInMS);

        const showtimeListOfTheater = await this.getShowtimeListOfTheaterMetadata(showtimeList, theaterRecord);

        return {
            theater: theaterRecord,
            showtimeListOfTheater
        };
    }

    public async getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number
    ): Promise<{
        theater: Theater;
        showtimeListOfTheater: ShowtimeDetail[];
    }> {
        if (!this.isValidDate(requestTime)) {
            this.logger.error("invalid date", { requestTime });
            requestTime = this.timer.getCurrentTime();
        }
        requestTime = this.convertTimeTo0AMInTheSameDay(requestTime);

        const theaterRecord = await this.theaterDM.getTheaterById(theaterId);
        if (theaterRecord === null) {
            this.logger.error("no theater with theater id found", { theaterId: theaterId });
            throw new ErrorWithStatus(`no movie with theater id ${theaterRecord} found`, status.NOT_FOUND);
        }

        const showtimeList = await this.showtimeDM.getShowtimeListOfTheaterByMovieId(
            theaterId,
            movieId,
            requestTime,
            this.showtimeRangeInMS
        );

        const showtimeListOfTheater = await this.getShowtimeListOfTheaterMetadata(showtimeList, theaterRecord);

        return {
            theater: theaterRecord,
            showtimeListOfTheater
        };
    }

    private async getShowtimeListOfTheaterMetadata(
        showtimeList: Showtime[],
        theaterRecord: Theater
    ): Promise<ShowtimeDetail[]> {
        const movieIdList: number[] = [];
        for (const showtime of showtimeList) {
            if (!movieIdList.includes(showtime.ofMovieId)) {
                movieIdList.push(showtime.ofMovieId);
            }
        }

        const movieListRecord = await Promise.all(
            movieIdList.map((movieId) => this.movieDM.getMovieById(movieId))
        );

        const movieMap = new Map();
        movieListRecord.forEach(movie => {
            movieMap.set(
                movie?.id,
                {
                    title: movie?.title,
                    movieType: {
                        id: movie?.movieType?.id,
                        displayName: movie?.movieType?.displayName
                    }
                }
            );
        });

        const screenIdList: number[] = [];
        for (const showtime of showtimeList) {
            if (!screenIdList.includes(showtime.ofScreenId)) {
                screenIdList.push(showtime.ofScreenId);
            }
        }

        const screenListRecord = await Promise.all(
            screenIdList.map((screenId) => this.screenDM.getScreenById(screenId))
        );

        const screenMap = new Map();
        screenListRecord.forEach(screen => {
            screenMap.set(
                screen?.id,
                {
                    id: screen?.id,
                    displayName: screen?.displayName,
                    ofTheaterId: screen?.ofTheaterId,
                    screenType: screen?.screenType
                });
        });

        const showtimeListOfTheater: ShowtimeDetail[] = [];
        for (let i = 0; i < showtimeList.length; i++) {
            const screen = screenMap.get(showtimeList[i].ofScreenId);
            const movie = movieMap.get(showtimeList[i].ofMovieId);
            showtimeListOfTheater.push({
                id: showtimeList[i].id,
                movieName: movie.title,
                movieType: {
                    id: movie.movieType.id,
                    displayName: movie.movieType.displayName
                },
                screenName: screen.displayName,
                seatCount: screen.screenType.seatCount,
                theaterName: theaterRecord.displayName,
                timeEnd: showtimeList[i].timeStart,
                timeStart: showtimeList[i].timeStart
            });
        }
        return showtimeListOfTheater;
    }

    private convertTimeTo0AMInTheSameDay(requestTime: number): number {
        return new Date(requestTime).setHours(0, 0, 0, 0);
    }

    private isValidDate(date: number): boolean {
        const dateStr = new Date(date).toISOString();
        return validator.isISO8601(dateStr);
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