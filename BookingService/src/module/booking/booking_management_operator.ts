import { injected, token } from "brandi";
import ms from "ms";
import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../config";
import { BOOKING_DATA_ACCESSOR_TOKEN, Booking, BookingDataAccessor, BookingStatus } from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer, promisifyGRPCCall } from "../../utils";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { status } from "@grpc/grpc-js";
import { Price, Seat, Showtime } from "./booking_metadata_model";
import { CheckBookingStatusAfterInitializeQueue, CHECK_BOOKING_STATUS_AFTER_INITIALIZE_QUEUE_TOKEN } from "../../dataaccess/bull";

export interface BookingManagementOperator {
    createBooking(
        userId: number,
        showtimeId: number,
        seatId: number,
        amount: number
    ): Promise<Booking>;
    getBookingWithStatus(bookingId: number, userId: number, bookingStatus: BookingStatus): Promise<Booking>;
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
        await this.checkBookingProcessingAndConfirmed(showtimeId, seatId);

        const showtime = await this.getShowtime(showtimeId);
        if (showtime === null) {
            this.logger.error("no showtime with showtime_id found", { showtimeId: showtimeId });
            throw new ErrorWithStatus(`no showtime with showtime_id=${showtimeId}`, status.NOT_FOUND);
        }

        const seat = await this.getSeat(seatId);
        if (seat === null) {
            this.logger.error("no seat with seat_id found", { seatId: seatId });
            throw new ErrorWithStatus(`no seat with seat_id=${seatId}`, status.NOT_FOUND);
        }

        const price = await this.getPrice(seatId, showtimeId);
        if (price === null) {
            this.logger.error("no price with seat_id and showtime_id found", { seatId: seatId, showtimeId: showtimeId });
            throw new ErrorWithStatus(`no price with seat_id=${seatId} and showtime_id=${showtimeId}`, status.NOT_FOUND);
        }

        if (amount !== price.price) {
            this.logger.error("invalid amount", { amount });
            throw new ErrorWithStatus(`invalid amount ${amount}`, status.INVALID_ARGUMENT);
        }

        const requestTime = this.timer.getCurrentTime();
        if (requestTime < showtime.timeStart - this.bookingTimeBeforeShowtimeStartInMs) {
            this.logger.error("expired time to create booking of showtime_id found", { showtimeId: showtimeId });
            throw new ErrorWithStatus(`expired time to create booking of showtime_id=${showtimeId}`, status.DEADLINE_EXCEEDED);
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

    public async getBookingWithStatus(bookingId: number, userId: number, bookingStatus: BookingStatus): Promise<Booking> {
        const booking = await this.bookingDM.getBookingWithStatus(bookingId, userId, bookingStatus);
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

    private async checkBookingProcessingAndConfirmed(showtimeId: number, seatId: number): Promise<void> {
        const bookingProcessingAndConfirmedCount = await Promise.all([
            await this.bookingDM.getBookingProcessingCount(showtimeId, seatId),
            await this.bookingDM.getBookingConfirmedCount(showtimeId, seatId),
        ]);

        const bookingProcessingCount = bookingProcessingAndConfirmedCount[0];
        const bookingConfirmedCount = bookingProcessingAndConfirmedCount[1];

        if (bookingProcessingCount > 0) {
            this.logger.error(
                "booking with showtime_id and seat_id already has status of pending or initializing",
                { showtimeId: showtimeId, seatId: seatId }
            );
            throw new ErrorWithStatus(
                `booking with showtime_id=${showtimeId} and seat_id=${seatId} already has status of pending or initializing`,
                status.ALREADY_EXISTS
            );
        }

        if (bookingConfirmedCount > 0) {
            this.logger.error(
                "booking with showtime_id and seat_id already has status of confirmed",
                { showtimeId: showtimeId, seatId: seatId }
            );
            throw new ErrorWithStatus(
                `booking with showtime_id=${showtimeId} and seat_id=${seatId} already has status of confirmed`,
                status.ALREADY_EXISTS
            );
        }
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

    private async getSeat(seatId: number): Promise<Seat | null> {
        const { error: getSeatError, response: getSeatResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getSeat.bind(this.movieServiceDM), { seatId });
        if (getSeatError !== null) {
            if (getSeatError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getSeat()", { error: getSeatError });
            throw new ErrorWithStatus("failed to get Seat", status.INTERNAL);
        }

        return Seat.fromProto(getSeatResponse?.seat);
    }

    private async getPrice(seatId: number, showtimeId: number): Promise<Price | null> {
        const { error: getPriceError, response: getPriceResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getPrice.bind(this.movieServiceDM), { seatId, showtimeId });
        if (getPriceError !== null) {
            if (getPriceError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getPrice()", { error: getPriceError });
            throw new ErrorWithStatus("failed to get Price", status.INTERNAL);
        }

        return Price.fromProto(getPriceResponse?.price);
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

