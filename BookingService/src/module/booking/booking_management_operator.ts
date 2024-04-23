import { injected, token } from "brandi";
import ms from "ms";
import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../config";
import { BOOKING_ACCESSOR_TOKEN, Booking, BookingDataAccessor, BookingStatus } from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer, promisifyGRPCCall } from "../../utils";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { status } from "@grpc/grpc-js";

export interface BookingManagementOperator {
    createBooking(
        userId: number,
        showtimeId: number,
        seatId: number,
        amount: number
    ): Promise<Booking>
}

export class BookingManagementOperatorImpl implements BookingManagementOperator {
    private readonly bookingTimeInMS: number;

    constructor(
        private readonly logger: Logger,
        private readonly bookingDM: BookingDataAccessor,
        private readonly timer: Timer,
        private readonly applicationConfig: ApplicationConfig,
        private readonly movieServiceDM: MovieServiceClient
    ) {
        this.bookingTimeInMS = ms(this.applicationConfig.bookingTime);
    }

    public async createBooking(userId: number, showtimeId: number, seatId: number, amount: number): Promise<Booking> {
        const requestTime = this.timer.getCurrentTime();
        const expireAt = requestTime + this.bookingTimeInMS;
        const { error: getPriceError, response: getPriceResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getPrice.bind(this.movieServiceDM),
            {
                seatId, showtimeId
            });

        if (getPriceError != null) {
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
            bookingStatus: BookingStatus.PENDING,
            bookingTime: requestTime,
            expireAt: expireAt
        });

        return {
            id: bookingId,
            ofSeatId: seatId,
            ofShowtimeId: showtimeId,
            ofUserId: userId,
            bookingStatus: BookingStatus.PENDING,
            amount: amount,
            bookingTime: requestTime,
            expireAt: expireAt,
        }
    }
}

injected(
    BookingManagementOperatorImpl,
    LOGGER_TOKEN,
    BOOKING_ACCESSOR_TOKEN,
    TIMER_TOKEN,
    APPLICATION_CONFIG_TOKEN,
    MOVIE_SERVICE_DM_TOKEN
);

export const BOOKING_MANAGEMENT_OPERATOR_TOKEN = token<BookingManagementOperator>("BookingManagementOperator");

