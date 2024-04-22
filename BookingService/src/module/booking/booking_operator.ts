import { injected, token } from "brandi";
import { Logger } from "winston";
import { BOOKING_ACCESSOR_TOKEN, BookingDataAccessor, BookingStatus } from "../../dataaccess/db";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { UserServiceClient } from "../../proto/gen/UserService";
import { LOGGER_TOKEN } from "../../utils";
import { USER_INFO_PROVIDER_TOKEN, UserInfoProvider } from "../info_providers";

export interface BookingOperator {
    processAfterPaymentTransactionCompleted(bookingId: number, userId: number): Promise<void>;
}

export class BookingOperatorImpl implements BookingOperator {
    constructor(
        private readonly logger: Logger,
        private readonly userServiceDM: UserServiceClient,
        private readonly userInfoProvider: UserInfoProvider,
        private readonly bookingDM: BookingDataAccessor
    ) { }

    public async processAfterPaymentTransactionCompleted(bookingId: number, userId: number): Promise<void> {
        await this.updateBookingStatus(bookingId);
    }

    private async updateBookingStatus(bookingId: number): Promise<void> {
        await this.bookingDM.withTransaction(async (bookingDM) => {
            const booking = await this.bookingDM.getBookingWithXLock(bookingId);
            if (booking === null) {
                this.logger.error("no booking with booking id found", { bookingId: bookingId });
                return;
            }

            if (booking.bookingStatus === BookingStatus.CONFIRMED) {
                this.logger.error("booking with booking_id already has status of confirmed", { bookingId: bookingId });
                return;
            }

            booking.bookingStatus = BookingStatus.CONFIRMED;
            await bookingDM.updateBooking(booking);
        });
    }
}

injected(
    BookingOperatorImpl,
    LOGGER_TOKEN,
    USER_SERVICE_DM_TOKEN,
    USER_INFO_PROVIDER_TOKEN,
    BOOKING_ACCESSOR_TOKEN
);

export const BOOKING_OPERATOR_TOKEN = token<BookingOperator>("BookingOperator");