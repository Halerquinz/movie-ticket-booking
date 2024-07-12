import { injected, token } from "brandi";
import { Logger } from "winston";
import { BOOKING_DATA_ACCESSOR_TOKEN, Booking, BookingDataAccessor, BookingStatus } from "../../dataaccess/db";
import { USER_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { UserServiceClient } from "../../proto/gen/user_service/UserService";
import { LOGGER_TOKEN } from "../../utils";

export enum PaymentTransactionStatus {
    PENDING = 0,
    SUCCESS = 1,
    CANCEL = 2
}

export interface BookingOperator {
    updateBookingStatusAfterPaymentTransactionCompleted(bookingId: number, status: any): Promise<void>;
    checkBookingStatusAfterInitialize(bookingId: number): Promise<void>;
}

export class BookingOperatorImpl implements BookingOperator {
    constructor(
        private readonly logger: Logger,
        private readonly userServiceDM: UserServiceClient,
        private readonly bookingDM: BookingDataAccessor
    ) { }

    public async updateBookingStatusAfterPaymentTransactionCompleted(bookingId: number, paymentTransactionStatus: PaymentTransactionStatus): Promise<void> {
        await this.bookingDM.withTransaction(async (bookingDM) => {
            const booking = await bookingDM.getBookingWithXLock(bookingId);
            if (booking === null) {
                this.logger.error("no booking with booking id found", { bookingId: bookingId });
                return;
            }

            if (booking.bookingStatus === BookingStatus.CONFIRMED) {
                this.logger.error("booking with booking_id already has status of confirmed", { bookingId: bookingId });
                return;
            }

            if (paymentTransactionStatus == PaymentTransactionStatus.CANCEL) {
                booking.bookingStatus = BookingStatus.CANCEL;
            } else if (paymentTransactionStatus === PaymentTransactionStatus.SUCCESS) {
                booking.bookingStatus = BookingStatus.CONFIRMED;
            }

            await bookingDM.updateBooking(booking);
            this.logger.info("successfully updated booking status", { bookingId: bookingId, status: booking.bookingStatus });
        });
    }

    public async checkBookingStatusAfterInitialize(bookingId: number): Promise<void> {
        await this.bookingDM.withTransaction(async (bookingDM) => {
            const booking = await bookingDM.getBookingWithXLock(bookingId);
            if (booking === null) {
                this.logger.error("no booking with booking id found", { bookingId: bookingId });
                return;
            }

            if (booking.bookingStatus === BookingStatus.INITIALIZING) {
                booking.bookingStatus = BookingStatus.CANCEL;
                await bookingDM.updateBooking(booking);
                this.logger.info("successfully to cancel booking", { bookingId: bookingId });
            }
        });

        this.logger.info("successfully to check booking status after initialize", { bookingId: bookingId });
    }
}

injected(
    BookingOperatorImpl,
    LOGGER_TOKEN,
    USER_SERVICE_DM_TOKEN,
    BOOKING_DATA_ACCESSOR_TOKEN
);

export const BOOKING_OPERATOR_TOKEN = token<BookingOperator>("BookingOperator");