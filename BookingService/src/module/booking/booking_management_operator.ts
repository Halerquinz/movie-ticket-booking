import { injected, token } from "brandi";
import ms from "ms";
import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../config";
import { BOOKING_ACCESSOR_TOKEN, Booking, BookingDataAccessor, BookingStatus } from "../../dataaccess/db";
import { LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";

export interface BookingManagementOperator {
    createBooking(
        userId: number,
        showTimeId: number,
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
        private readonly applicationConfig: ApplicationConfig
    ) {
        this.bookingTimeInMS = ms(this.applicationConfig.bookingTime);
    }

    public async createBooking(userId: number, showTimeId: number, seatId: number, amount: number): Promise<Booking> {
        const requestTime = this.timer.getCurrentTime();
        const expireAt = requestTime + this.bookingTimeInMS
        const bookingId = await this.bookingDM.createBooking({
            ofUserId: userId,
            ofShowtimeId: showTimeId,
            ofSeatId: seatId,
            amount: amount,
            bookingStatus: BookingStatus.PENDING,
            bookingTime: requestTime,
            expireAt: expireAt
        });

        return {
            id: bookingId,
            ofSeatId: seatId,
            ofShowtimeId: showTimeId,
            ofUserId: userId,
            bookingStatus: BookingStatus.PENDING,
            amount: amount,
            bookingTime: requestTime,
            expireAt: expireAt,
        }
    }
}

injected(BookingManagementOperatorImpl, LOGGER_TOKEN, BOOKING_ACCESSOR_TOKEN, TIMER_TOKEN, APPLICATION_CONFIG_TOKEN);

export const BOOKING_MANAGEMENT_OPERATOR_TOKEN = token<BookingManagementOperator>("BookingManagementOperator");

