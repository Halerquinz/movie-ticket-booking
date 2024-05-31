import { injected, token } from "brandi";
import { CHECKOUT_SESSION_HANDLER_TOKEN, PaymentTransactionDetail, CheckoutSessionHandler } from "./checkout_session_handler";
import { PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN, PaymentTransactionDataAccessor, PaymentTransactionStatus } from "../dataaccess/db";
import { Logger } from "winston";
import { LOGGER_TOKEN } from "../utils";
import { PAYMENT_TRANSACTION_COMPLETED_PRODUCER_TOKEN, PaymentTransactionCompletedProducer } from "../dataaccess/kafka";

export class PaymentTransactionNotFound extends Error {
    constructor() {
        super("no payment transaction with the provided payment_transaction_id found");
    }
}

export interface CheckoutOperator {
    onCreatePaymentTransaction(checkoutMetadata: PaymentTransactionDetail): Promise<{ id: string, url: string; }>;
    onCancelPaymentTransaction(checkoutSessionId: string): Promise<void>;
    onPaymentThirdPartyResponse(payload: Buffer, signature: string): Promise<void>;
}

export class CheckoutOperatorImpl implements CheckoutOperator {
    constructor(
        private readonly checkoutSessionHandler: CheckoutSessionHandler,
        private readonly paymentTransactionDM: PaymentTransactionDataAccessor,
        private readonly logger: Logger,
        private readonly paymentTransactionCompletedProducer: PaymentTransactionCompletedProducer,
    ) { }

    public async onCreatePaymentTransaction(checkoutMetadata: PaymentTransactionDetail): Promise<{ id: string, url: string; }> {
        const checkoutSession = await this.checkoutSessionHandler.createCheckoutSession(checkoutMetadata);
        return {
            id: checkoutSession?.id!,
            url: checkoutSession?.url!
        };
    }

    public async onCancelPaymentTransaction(checkoutSessionId: string): Promise<void> {
        return this.checkoutSessionHandler.cancelCheckoutSession(checkoutSessionId);
    }

    public async onPaymentThirdPartyResponse(payload: Buffer, signature: string): Promise<void> {
        const event = this.checkoutSessionHandler.constructEvent(payload, signature);
        const session = event.data.object as any;
        const transactionId = +session.metadata.transaction_id;

        this.logger.info(`received webhook response with transaction_id=${transactionId}`);

        let paymentTransactionStatus = PaymentTransactionStatus.SUCCESS;
        if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
            paymentTransactionStatus = PaymentTransactionStatus.CANCEL;
        }

        const paymentTransaction =
            await this.paymentTransactionDM.getPaymentTransactionWithXLock(transactionId);
        if (paymentTransaction === null) {
            this.logger.error("no payment transaction with payment_transaction_id found", { transactionId });
            throw new PaymentTransactionNotFound();
        }

        paymentTransaction.status = paymentTransactionStatus;
        await this.paymentTransactionDM.updatePaymentTransaction(paymentTransaction);
        await this.paymentTransactionCompletedProducer.createPaymentTransactionCompletedMessage({
            ofBookingId: paymentTransaction.ofBookingId,
            paymentTransactionStatus: paymentTransaction.status
        });

        this.logger.info("successfully updated payment transaction status information to database", {
            paymentTransactionId: transactionId,
            status: paymentTransactionStatus
        });
    }
}

injected(
    CheckoutOperatorImpl,
    CHECKOUT_SESSION_HANDLER_TOKEN,
    PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN,
    PAYMENT_TRANSACTION_COMPLETED_PRODUCER_TOKEN
);

export const CHECKOUT_OPERATOR_TOKEN = token<CheckoutOperator>("CheckoutOperator");