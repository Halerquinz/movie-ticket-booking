import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import ms from "ms";
import validator from "validator";
import { Logger } from "winston";
import {
    MOVIE_DATA_ACCESSOR_TOKEN,
    MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN,
    MovieDataAccessor,
    MovieTypeHasScreenTypeDataAccessor,
    SCREEN_DATA_ACCESSOR_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    ScreenDataAccessor,
    Showtime,
    ShowtimeDataAccessor,
    ShowtimeDayOfTheWeekType,
    ShowtimeSlotType
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";

export interface ShowtimeManagementOperator {
    createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
    ): Promise<Showtime>;
    deleteShowtime(id: number): Promise<void>;
}

export class ShowtimeManagementOperatorImpl implements ShowtimeManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly showtimeDM: ShowtimeDataAccessor,
        private readonly movieDM: MovieDataAccessor,
        private readonly screenDM: ScreenDataAccessor,
        private readonly movieTypeHasScreenTypeDM: MovieTypeHasScreenTypeDataAccessor,
        private readonly timer: Timer
    ) { }

    public async createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
    ): Promise<Showtime> {
        const requestTime = this.timer.getCurrentTime();
        if (!this.isValidReleaseDate(timeStart) || timeStart < requestTime) {
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

        const movieTypeHasScreenType =
            await this.movieTypeHasScreenTypeDM.getMovieTypeHasScreenType(movie.movieType!.id, screen.screenType!.id);
        if (movieTypeHasScreenType === null) {
            this.logger.error("no movie has screen type", { movieTypeId: movie.movieType!.id });
            throw new ErrorWithStatus(`no movie has screen type with movie_type_id ${movie.movieType!.id} found`, status.NOT_FOUND);
        }

        const timeEnd = timeStart + ms(`${movie.duration}m`);
        const showtimeSlotId = this.getSlotId(timeStart);
        const showtimeDayOfTheWeekId = this.getDayOfTheWeekId(timeStart);

        return this.showtimeDM.withTransaction<Showtime>(async (showtimeDM) => {
            const createdShowtimeId = await showtimeDM.createShowtime({
                ofMovieId: movieId,
                ofScreenId: screenId,
                timeEnd: timeEnd,
                timeStart: timeStart,
                of_showtime_slot_id: showtimeSlotId,
                of_showtime_day_of_the_week_id: showtimeDayOfTheWeekId
            })

            return {
                id: createdShowtimeId,
                ofScreenId: screenId,
                ofMovieId: movieId,
                timeEnd: timeEnd,
                timeStart: timeStart,
                showtimeDayOfTheWeek: {
                    id: showtimeDayOfTheWeekId,
                    displayName: ""
                },
                showtimeSlot: {
                    id: showtimeSlotId,
                    displayName: ""
                }
            }
        })
    }

    public async deleteShowtime(id: number): Promise<void> {
        return this.showtimeDM.deleteShowtime(id);
    }

    private isValidReleaseDate(timestamp: number): boolean {
        const dateStr = new Date(timestamp).toISOString();
        return validator.isISO8601(dateStr);
    }

    private getDayOfTheWeekId(timestamp: number): ShowtimeDayOfTheWeekType {
        const dayOfTheWeek = new Date(timestamp).getDay();

        if (dayOfTheWeek > 0 && dayOfTheWeek < 5) return ShowtimeDayOfTheWeekType.MONTOTHIRS;
        return ShowtimeDayOfTheWeekType.FRITOSUN;
    }

    private getSlotId(timestamp: number): ShowtimeSlotType {
        const hours = new Date(timestamp).getHours();

        if (hours < 17) return ShowtimeSlotType.BEFORE5PM;
        return ShowtimeSlotType.AFTER5PM
    }
}

injected(
    ShowtimeManagementOperatorImpl,
    LOGGER_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    MOVIE_DATA_ACCESSOR_TOKEN,
    SCREEN_DATA_ACCESSOR_TOKEN,
    MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN,
    TIMER_TOKEN
);

export const SHOWTIME_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeManagementOperator>("ShowtimeManagementOperator");