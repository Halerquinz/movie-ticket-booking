import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    MOVIE_DATA_ACCESSOR_TOKEN,
    MovieDataAccessor,
    SCREEN_DATA_ACCESSOR_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    ScreenDataAccessor,
    Showtime,
    ShowtimeDataAccessor,
    ShowtimeType
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface ShowtimeManagementOperator {
    createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
        timeEnd: number,
        showtimeType: ShowtimeType
    ): Promise<Showtime>;
    deleteShowtime(id: number): Promise<void>;
}

export class ShowtimeManagementOperatorImpl implements ShowtimeManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly showtimeDM: ShowtimeDataAccessor,
        private readonly movieDM: MovieDataAccessor,
        private readonly screenDM: ScreenDataAccessor
    ) { }

    public async createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
        timeEnd: number,
        showtimeType: ShowtimeType
    ): Promise<Showtime> {
        if (
            !this.isValidReleaseDate(timeStart) &&
            !this.isValidReleaseDate(timeEnd) &&
            timeEnd - timeStart <= 0
        ) {
            this.logger.error("invalid time", { timeStart, timeEnd });
            throw new ErrorWithStatus(`invalid time ${timeStart} ${timeEnd}`, status.INVALID_ARGUMENT);
        }

        const movie = await this.movieDM.getMovieById(movieId);
        if (movie === null) {
            this.logger.error("no movie with movie_id", { movieId });
            throw new ErrorWithStatus(`no movie with movie_id ${movieId} found`, status.NOT_FOUND);
        }

        const screen = await this.screenDM.getScreenById(screenId);
        if (screen === null) {
            this.logger.error("no screen with screenId", { screenId });
            throw new ErrorWithStatus(`no screen with screen_id ${screenId} found`, status.NOT_FOUND);
        }

        return this.showtimeDM.withTransaction<Showtime>(async (showtimeDM) => {
            const createdShowtimeId = await showtimeDM.createShowtime({
                ofMovieId: movieId,
                ofScreenId: screenId,
                showtimeType: showtimeType,
                timeEnd: timeEnd,
                timeStart: timeStart
            })

            return {
                showtimeId: createdShowtimeId,
                ofScreenId: screenId,
                ofMovieId: movieId,
                showtimeType: showtimeType,
                timeEnd: timeEnd,
                timeStart: timeStart
            }
        })

    }

    public async deleteShowtime(id: number): Promise<void> {
        return this.showtimeDM.deleteShowtime(id);

    }

    private isValidReleaseDate(releaseDate: number): boolean {
        const dateStr = new Date(releaseDate).toISOString();
        return validator.isISO8601(dateStr);
    }
}

injected(
    ShowtimeManagementOperatorImpl,
    LOGGER_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    MOVIE_DATA_ACCESSOR_TOKEN,
    SCREEN_DATA_ACCESSOR_TOKEN
);

export const SHOWTIME_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeManagementOperator>("ShowtimeManagementOperator");