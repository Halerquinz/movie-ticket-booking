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
    PRICE_DATA_ACCESSOR_TOKEN,
    PriceDataAccessor,
    SCREEN_DATA_ACCESSOR_TOKEN,
    SEAT_DATA_ACCESSOR_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    ScreenDataAccessor,
    SeatDataAccessor,
    Showtime,
    ShowtimeDataAccessor,
    ShowtimeDayOfTheWeekType,
    ShowtimeSlotType,
    THEATER_DATA_ACCESSOR_TOKEN,
    TheaterDataAccessor
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer, promisifyGRPCCall } from "../../utils";
import { ShowtimeMetadata } from "../../proto/gen/ShowtimeMetadata";
import { SeatMetadata } from "../../proto/gen/SeatMetadata";
import { BookingServiceClient } from "../../proto/gen/BookingService";
import { _SeatStatus_Values } from "../../proto/gen/SeatStatus";
import { BOOKING_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";

export interface ShowtimeManagementOperator {
    createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
    ): Promise<Showtime>;
    deleteShowtime(id: number): Promise<void>;
    getShowtime(id: number): Promise<Showtime>;
    getShowtimeMetadata(id: number): Promise<ShowtimeMetadata>;
}

export class ShowtimeManagementOperatorImpl implements ShowtimeManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly showtimeDM: ShowtimeDataAccessor,
        private readonly theaterDM: TheaterDataAccessor,
        private readonly seatDM: SeatDataAccessor,
        private readonly movieDM: MovieDataAccessor,
        private readonly screenDM: ScreenDataAccessor,
        private readonly priceDM: PriceDataAccessor,
        private readonly movieTypeHasScreenTypeDM: MovieTypeHasScreenTypeDataAccessor,
        private readonly bookingServiceDM: BookingServiceClient,
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
        });
    }

    public async deleteShowtime(id: number): Promise<void> {
        return this.showtimeDM.deleteShowtime(id);
    }

    public async getShowtime(id: number): Promise<Showtime> {
        const showtime = await this.showtimeDM.getShowtime(id);
        if (showtime === null) {
            this.logger.error("no showtime with showtime_id found", { showtimeId: id });
            throw new ErrorWithStatus(`no showtime with showtime_id ${id} found`, status.NOT_FOUND);
        }

        return showtime;
    }

    public async getShowtimeMetadata(id: number): Promise<ShowtimeMetadata> {
        const showtimeRecord = await this.showtimeDM.getShowtime(id);
        if (showtimeRecord === null) {
            this.logger.error("no showtime with showtime_id found", { showtimeId: id });
            throw new ErrorWithStatus(`no showtime with showtime_id ${id} found`, status.NOT_FOUND);
        }

        const screen = await this.screenDM.getScreenById(showtimeRecord.ofScreenId);
        if (screen === null) {
            this.logger.error("no screen with screen_id found", { screenId: showtimeRecord.ofScreenId });
            throw new ErrorWithStatus(`no screen with screen_id=${showtimeRecord.ofScreenId}`, status.NOT_FOUND);
        }
        const seats = await this.seatDM.getSeatsOfScreen(showtimeRecord.ofScreenId);

        const movie = await this.movieDM.getMovieById(showtimeRecord.ofMovieId);
        if (movie === null) {
            this.logger.error("no movie with movie_id found", { movieId: showtimeRecord.ofMovieId });
            throw new ErrorWithStatus(`no movie with movie_id=${showtimeRecord.ofMovieId}`, status.NOT_FOUND);
        }

        const theater = await this.theaterDM.getTheaterById(screen.ofTheaterId);
        if (theater === null) {
            this.logger.error("no theater with theater_id found", { theaterId: screen.ofTheaterId });
            throw new ErrorWithStatus(`no theater with theater_id=${screen.ofTheaterId}`, status.NOT_FOUND);
        }

        const { error: getBookingListProcessingAndConfirmedError, response: getBookingListProcessingAndConfirmedResponse } = await promisifyGRPCCall(
            this.bookingServiceDM.getBookingListProcessingAndConfirmedByShowtimeId.bind(this.bookingServiceDM),
            { showtimeId: id }
        );

        if (getBookingListProcessingAndConfirmedError !== null) {
            this.logger.error("failed to call booking.getBookingListProcessingAndConfirmedByShowtimeId()", {
                error: getBookingListProcessingAndConfirmedError
            });
            throw new ErrorWithStatus("failed to get booking list processing and confirmed", status.INTERNAL);
        }

        const bookingListProcessingAndConfirmed = getBookingListProcessingAndConfirmedResponse?.bookingList!;

        const bookingProcessingAndConfirmedMap = new Map<number, number>();
        for (const booking of bookingListProcessingAndConfirmed) {
            bookingProcessingAndConfirmedMap.set(booking.ofSeatId!, booking.bookingStatus!);
        }

        console.log(seats);

        let seatsMetadata: SeatMetadata[] = [];
        for (const seat of seats) {
            const price = await this.priceDM.getPrice(
                showtimeRecord.ofMovieId,
                seat.seatType?.id!,
                showtimeRecord.showtimeDayOfTheWeek?.id!,
                showtimeRecord.showtimeSlot?.id!,
            );

            let status: _SeatStatus_Values = _SeatStatus_Values.AVAILABLE;
            if (bookingProcessingAndConfirmedMap.has(seat.id)) {
                status = _SeatStatus_Values.UNAVAILABLE;
            }

            seatsMetadata.push({
                id: seat.id,
                column: seat.column,
                no: seat.no,
                ofScreenId: seat.ofScreenId,
                price: price?.price,
                row: seat.row,
                seatType: seat.seatType as any,
                status: status
            })
        }

        return {
            movie: movie,
            screen: screen,
            seats: seatsMetadata,
            showtime: showtimeRecord,
            theater: theater
        }
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
    THEATER_DATA_ACCESSOR_TOKEN,
    SEAT_DATA_ACCESSOR_TOKEN,
    MOVIE_DATA_ACCESSOR_TOKEN,
    SCREEN_DATA_ACCESSOR_TOKEN,
    PRICE_DATA_ACCESSOR_TOKEN,
    MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN,
    BOOKING_SERVICE_DM_TOKEN,
    TIMER_TOKEN
);

export const SHOWTIME_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeManagementOperator>("ShowtimeManagementOperator");