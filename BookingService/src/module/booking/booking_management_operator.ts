import { injected, token } from "brandi";
import ms from "ms";
import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../config";
import { BOOKING_DATA_ACCESSOR_TOKEN, Booking, BookingDataAccessor, BookingStatus } from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer, promisifyGRPCCall } from "../../utils";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { status } from "@grpc/grpc-js";
import { Showtime } from "./showtime_model";
import { CHECK_BOOKING_STATUS_AFTER_INITIALIZE_QUEUE_TOKEN, CheckBookingStatusAfterInitializeQueue } from "../../dataaccess/bull/jobqueue/check_booking_status_after_initialize";

export interface BookingManagementOperator {
    createBooking(
        userId: number,
        showtimeId: number,
        seatId: number,
        amount: number
    ): Promise<Booking>;
    getBooking(bookingId: number): Promise<Booking>;
    updateBookingStatusFromInitializingToPending(bookingId: number): Promise<void>;
}

export class BookingManagementOperatorImpl implements BookingManagementOperator {
    private readonly bookingTimeInMS: number;
    private readonly bookingTimeBeforeShowtimeStartInMs: number

    constructor(
        private readonly logger: Logger,
        private readonly bookingDM: BookingDataAccessor,
        private readonly timer: Timer,
        private readonly applicationConfig: ApplicationConfig,
        private readonly movieServiceDM: MovieServiceClient,
        private readonly checkBookingStatusAfterInitializeQueue: CheckBookingStatusAfterInitializeQueue
    ) {
        this.bookingTimeInMS = ms(this.applicationConfig.expireTimeAfterInitializeBooking);
        this.bookingTimeBeforeShowtimeStartInMs = ms(this.applicationConfig.bookingTimeBeforeShowtimeStart);
    }

    public async createBooking(userId: number, showtimeId: number, seatId: number, amount: number): Promise<Booking> {
        const showtime = await this.getShowtime(showtimeId);
        if (showtime === null) {
            this.logger.error("no showtime with showtime_id found", { showtimeId: showtimeId });
            throw new ErrorWithStatus(`no showtime with showtime_id=${showtimeId}`, status.NOT_FOUND);
        }

        const requestTime = this.timer.getCurrentTime();
        if (requestTime < showtime.timeStart - this.bookingTimeBeforeShowtimeStartInMs) {
            this.logger.error("expired time to create booking of showtime_id found", { showtimeId: showtimeId });
            throw new ErrorWithStatus(`expired time to create booking of showtime_id=${showtimeId}`, status.DEADLINE_EXCEEDED);
        }

        const expireAt = requestTime + this.bookingTimeInMS;
        const { error: getPriceError, response: getPriceResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getPrice.bind(this.movieServiceDM),
            {
                seatId, showtimeId
            });

        if (getPriceError !== null) {
            this.logger.error("failed to call price.getPrice()", { error: getPriceError });
            throw getPriceError;
        }

        if (amount !== getPriceResponse?.price?.price) {
            this.logger.error("invalid amount", { amount });
            throw new ErrorWithStatus(`invalid amount ${amount}`, status.INVALID_ARGUMENT);
        }

        const bookingId = await this.bookingDM.createBooking({
            ofUserId: userId,
            ofShowtimeId: showtimeId,
            ofSeatId: seatId,
            amount: amount,
            bookingStatus: BookingStatus.INITIALIZING,
            bookingTime: requestTime,
        });

        await this.checkBookingStatusAfterInitializeQueue.addCheckBookingStatusAfterInitializeQueue(bookingId);

        return {
            id: bookingId,
            ofSeatId: seatId,
            ofShowtimeId: showtimeId,
            ofUserId: userId,
            bookingStatus: BookingStatus.INITIALIZING,
            amount: amount,
            bookingTime: requestTime,
        }
    }

    public async getBooking(bookingId: number): Promise<Booking> {
        const booking = await this.bookingDM.getBooking(bookingId);
        if (booking === null) {
            this.logger.error("no booking with booking_id found", { bookingId });
            throw new ErrorWithStatus(`no booking with booking_id ${bookingId} found`, status.NOT_FOUND);
        }

        return booking;
    }

    public async updateBookingStatusFromInitializingToPending(bookingId: number): Promise<void> {
        await this.bookingDM.withTransaction(async (bookingDM) => {
            const booking = await bookingDM.getBookingWithXLock(bookingId);
            if (booking === null) {
                this.logger.error("no booking with booking_id found", { booking });
                throw new ErrorWithStatus(`no booking with booking_id ${booking} found`, status.NOT_FOUND);
            }

            if (booking.bookingStatus !== BookingStatus.INITIALIZING) {
                this.logger.error("booking with booking_id doesn't have status initializing", { booking });
                throw new ErrorWithStatus(`booking with booking_id ${bookingId} doesn't have status initializing`, status.FAILED_PRECONDITION);
            }

            booking.bookingStatus = BookingStatus.PENDING;
            await bookingDM.updateBooking(booking);
        });
    }

    private async getShowtime(showtimeId: number): Promise<Showtime | null> {
        const { error: getShowtimeError, response: getShowtimeResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getShowtime.bind(this.movieServiceDM), { showtimeId });
        if (getShowtimeError !== null) {
            if (getShowtimeError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getShowtime()", { error: getShowtimeError });
            throw new ErrorWithStatus("failed to get showtime", status.INTERNAL);
        }

        return Showtime.fromProto(getShowtimeResponse?.showtime);
    }
}

injected(
    BookingManagementOperatorImpl,
    LOGGER_TOKEN,
    BOOKING_DATA_ACCESSOR_TOKEN,
    TIMER_TOKEN,
    APPLICATION_CONFIG_TOKEN,
    MOVIE_SERVICE_DM_TOKEN,
    CHECK_BOOKING_STATUS_AFTER_INITIALIZE_QUEUE_TOKEN
);

export const BOOKING_MANAGEMENT_OPERATOR_TOKEN = token<BookingManagementOperator>("BookingManagementOperator");

