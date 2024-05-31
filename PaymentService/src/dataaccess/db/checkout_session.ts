import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";

export class CheckoutSession {
    constructor(
        public ofPaymentTransactionId: number,
        public checkoutSessionId: string,
        public url: string,
    ) { }
}

export interface CheckoutSessionDataAccessor {
    createCheckoutSession(ofPaymentTransactionId: number, url: string, checkoutSessionId: string): Promise<void>;
    getCheckoutSession(ofPaymentTransactionId: number): Promise<CheckoutSession | null>;
    withTransaction<T>(cb: (dataAccessor: CheckoutSessionDataAccessor) => Promise<T>): Promise<T>;
}

const TabNamePaymentServiceCheckoutSession = "payment_service_checkout_session_tab";
const ColNamePaymentServiceCheckoutSessionOfPaymentTransactionId = "of_payment_transaction_id";
const ColNamePaymentServiceCheckoutSessionId = "checkout_session_id";
const ColNamePaymentServiceCheckoutSessionUrl = "url";


export class CheckoutSessionDataAccessorImpl implements CheckoutSessionDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger,
        private readonly timer: Timer,
    ) { }

    public async createCheckoutSession(ofPaymentTransactionId: number, url: string, checkoutSessionId: string): Promise<void> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNamePaymentServiceCheckoutSessionOfPaymentTransactionId]: ofPaymentTransactionId,
                    [ColNamePaymentServiceCheckoutSessionId]: checkoutSessionId,
                    [ColNamePaymentServiceCheckoutSessionUrl]: url,
                })
                .into(TabNamePaymentServiceCheckoutSession);
        } catch (error) {
            this.logger.error("failed to create checkout session", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getCheckoutSession(ofPaymentTransactionId: number): Promise<CheckoutSession | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNamePaymentServiceCheckoutSession)
                .where(ColNamePaymentServiceCheckoutSessionOfPaymentTransactionId, "=", ofPaymentTransactionId);
            if (rows.length === 0) {
                this.logger.debug("no checkout session with payment transaction id found", { paymentTransactionId: ofPaymentTransactionId });
                return null;
            }
            if (rows.length > 1) {
                this.logger.debug("more than one checkout session with payment_transaction_id found", { paymentTransactionId: ofPaymentTransactionId });
                throw new ErrorWithStatus(
                    `more than one checkout session with payment_transaction_id ${ofPaymentTransactionId} found`,
                    status.INTERNAL
                );
            }
            return this.getCheckoutSessionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get transaction payment", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }


    public async getPaymentTransactionWithXLock(id: number): Promise<CheckoutSession | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNamePaymentServiceCheckoutSession)
                .where(ColNamePaymentServiceCheckoutSessionOfPaymentTransactionId, "=", id)
                .forUpdate();
            if (rows.length === 0) {
                this.logger.debug("no payment transaction with payment_transaction_id found", { paymentTransactionId: id });
                return null;
            }
            if (rows.length > 1) {
                this.logger.debug("more than one payment transaction with payment_transaction_id found", { paymentTransactionId: id });
                throw new ErrorWithStatus(
                    `more than one payment transaction with payment_transaction_id ${id} found`,
                    status.INTERNAL
                );
            }
            return this.getCheckoutSessionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get transaction payment", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: CheckoutSessionDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new CheckoutSessionDataAccessorImpl(tx, this.logger, this.timer);
            return cb(txDataAccessor);
        });
    }

    private getCheckoutSessionFromRow(row: Record<string, any>): CheckoutSession {
        return new CheckoutSession(
            +row[ColNamePaymentServiceCheckoutSessionOfPaymentTransactionId],
            row[ColNamePaymentServiceCheckoutSessionId],
            row[ColNamePaymentServiceCheckoutSessionUrl],
        );
    }
}

injected(CheckoutSessionDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN, TIMER_TOKEN);

export const CHECKOUT_SESSION_DATA_ACCESSOR_TOKEN = token<CheckoutSessionDataAccessor>("CheckoutSessionDataAccessor");