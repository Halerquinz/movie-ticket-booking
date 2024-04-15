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
} from "../../dataaccess/db";
import { _ShowtimeType_Values } from "../../proto/gen/ShowtimeType";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface ShowtimeManagementOperator {
    createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
        showtimeType: _ShowtimeType_Values
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
        showtimeType: _ShowtimeType_Values
    ): Promise<Showtime> {
        if (!this.isValidReleaseDate(timeStart)) {
            this.logger.error("invalid time start", { timeStart, });
            throw new ErrorWithStatus(`invalid time start${timeStart}`, status.INVALID_ARGUMENT);
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

        const timeEnd = timeStart + movie.duration * 60 * 1000; // minutes to ms

        return this.showtimeDM.withTransaction<Showtime>(async (showtimeDM) => {
            const createdShowtimeId = await showtimeDM.createShowtime({
                ofMovieId: movieId,
                ofScreenId: screenId,
                showtimeType: showtimeType,
                timeEnd: timeEnd,
                timeStart: timeStart
            })

            return {
                id: createdShowtimeId,
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