import { injected, token } from "brandi";
import { Logger } from "winston";
import { BOOKING_OPERATOR_TOKEN, BookingOperator, PaymentTransactionStatus } from "../module/booking";
import { LOGGER_TOKEN } from "../utils";

export class PaymentTransactionCompleted {
    constructor(
        public ofBookingId: number,
        public paymentTransactionStatus: PaymentTransactionStatus
    ) { }
}

export interface PaymentTransactionCompletedMessageHandler {
    onPaymentTransactionCompleted(message: PaymentTransactionCompleted): Promise<void>;
}

export class PaymentTransactionCompletedMessageHandlerImpl implements PaymentTransactionCompletedMessageHandler {
    constructor(
        private readonly bookingOperator: BookingOperator,
        private readonly logger: Logger
    ) { }

    public async onPaymentTransactionCompleted(message: PaymentTransactionCompleted): Promise<void> {
        this.logger.info(
            "payment_service_payment_transaction_completed message received",
            { payload: message }
        );

        if (message.ofBookingId === undefined) {
            this.logger.error("booking_id is required", { payload: message });
            return;
        }

        await this.bookingOperator.updateBookingStatusAfterPaymentTransactionCompleted(
            message.ofBookingId,
            message.paymentTransactionStatus
        );
    }
}

injected(
    PaymentTransactionCompletedMessageHandlerImpl,
    BOOKING_OPERATOR_TOKEN,
    LOGGER_TOKEN
);

export const PAYMENT_TRANSACTION_COMPLETED_MESSAGE_HANDLER_TOKEN =
    token<PaymentTransactionCompletedMessageHandler>(
        "PaymentTransactionCompletedMessageHandler"
    );