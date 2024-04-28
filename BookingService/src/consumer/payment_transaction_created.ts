import { injected, token } from "brandi";
import { Logger } from "winston";
import { BOOKING_OPERATOR_TOKEN, BookingOperator } from "../module/booking";
import { LOGGER_TOKEN } from "../utils";

export class PaymentTransactionCreated {
    constructor(
        public ofBookingId: number,
    ) { }
}

export interface PaymentTransactionCreatedMessageHandler {
    onPaymentTransactionCreated(message: PaymentTransactionCreated): Promise<void>;
}

export class PaymentTransactionCreatedMessageHandlerImpl implements PaymentTransactionCreatedMessageHandler {
    constructor(
        private readonly bookingOperator: BookingOperator,
        private readonly logger: Logger
    ) { }

    public async onPaymentTransactionCreated(message: PaymentTransactionCreated): Promise<void> {
        this.logger.info(
            "payment_service_payment_transaction_created message received",
            { payload: message }
        );

        if (message.ofBookingId === undefined) {
            this.logger.error("booking_id is required", { payload: message });
            return;
        }

        await this.bookingOperator.updateBookingStatus(message.ofBookingId);
    }
}

injected(
    PaymentTransactionCreatedMessageHandlerImpl,
    BOOKING_OPERATOR_TOKEN,
    LOGGER_TOKEN
);

export const PAYMENT_TRANSACTION_CREATED_MESSAGE_HANDLER_TOKEN =
    token<PaymentTransactionCreatedMessageHandler>(
        "PaymentTransactionCreatedMessageHandler"
    );