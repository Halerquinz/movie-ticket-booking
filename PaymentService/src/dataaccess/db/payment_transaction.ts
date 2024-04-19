import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";

export enum PaymentTransactionStatus {
    PENDING = 0,
    SUCCESS = 1,
    CANCEL = 2
}

export class PaymentTransaction {
    constructor(
        public id: number,
        public ofBookingId: number,
        public amount: number,
        public status: PaymentTransactionStatus,
        public requestTime: number,
        public updateTime: number
    ) { }
}

export interface PaymentTransactionDataAccessor {
    createPaymentTransaction(ofBookingId: number, amount: number, requestTime: number, transactionStatus: PaymentTransactionStatus): Promise<number>;
    updatePaymentTransaction(paymentTransaction: PaymentTransaction): Promise<void>;
    getPaymentTransactionWithXLock(id: number): Promise<PaymentTransaction | null>;
    withTransaction<T>(cb: (dataAccessor: PaymentTransactionDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameBookingServicePaymentTransaction = "booking_service_payment_transaction_tab";
const ColNameBookingServicePaymentTransactionId = "payment_transaction_id";
const ColNameBookingServicePaymentOfBookingId = "of_booking_id";
const ColNameBookingServicePaymentAmount = "amount";
const ColNameBookingServicePaymentRequestTime = "request_time";
const ColNameBookingServicePaymentUpdateTime = "update_time";
const ColNameBookingServicePaymentStatus = "status";


export class PaymentTransactionDataAccessorImpl implements PaymentTransactionDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger,
        private readonly timer: Timer,
    ) { }

    public async createPaymentTransaction(
        ofBookingId: number,
        amount: number,
        requestTime: number,
        transactionStatus: PaymentTransactionStatus
    ): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameBookingServicePaymentOfBookingId]: ofBookingId,
                    [ColNameBookingServicePaymentAmount]: amount,
                    [ColNameBookingServicePaymentStatus]: transactionStatus,
                    [ColNameBookingServicePaymentRequestTime]: requestTime,
                    [ColNameBookingServicePaymentUpdateTime]: this.timer.getCurrentTime()
                })
                .returning(ColNameBookingServicePaymentTransactionId)
                .into(TabNameBookingServicePaymentTransaction);
            return +rows[0][ColNameBookingServicePaymentTransactionId];
        } catch (error) {
            this.logger.error("failed to create payment transaction", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

    }

    public async updatePaymentTransaction(paymentTransaction: PaymentTransaction): Promise<void> {
        try {
            await this.knex
                .table(TabNameBookingServicePaymentTransaction)
                .update({
                    [ColNameBookingServicePaymentOfBookingId]: paymentTransaction.ofBookingId,
                    [ColNameBookingServicePaymentAmount]: paymentTransaction.amount,
                    [ColNameBookingServicePaymentStatus]: paymentTransaction.status,
                    [ColNameBookingServicePaymentRequestTime]: paymentTransaction.requestTime,
                    [ColNameBookingServicePaymentUpdateTime]: this.timer.getCurrentTime()
                })
                .where(ColNameBookingServicePaymentTransactionId, "=", paymentTransaction.id)
                .into(TabNameBookingServicePaymentTransaction);
        } catch (error) {
            this.logger.error("failed to update payment transaction", {
                paymentTransaction,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getPaymentTransactionWithXLock(id: number): Promise<PaymentTransaction | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameBookingServicePaymentTransaction)
                .where(ColNameBookingServicePaymentTransactionId, "=", id)
                .forUpdate();
            if (rows.length === 0) {
                this.logger.debug("no payment transaction with payment_transaction_id found", { paymentTransactionId: id });
                return null;
            }
            if (rows.length > 1) {
                this.logger.debug("more than one payment transaction with  payment_transaction_id found", { paymentTransactionId: id });
                throw new ErrorWithStatus(
                    `more than one payment transaction with payment_transaction_id ${id} found`,
                    status.INTERNAL
                );
            }
            return this.getPaymentTransactionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get detection task", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: PaymentTransactionDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new PaymentTransactionDataAccessorImpl(tx, this.logger, this.timer);
            return cb(txDataAccessor);
        });
    }

    private getPaymentTransactionFromRow(row: Record<string, any>): PaymentTransaction {
        return new PaymentTransaction(
            +row[ColNameBookingServicePaymentTransactionId],
            +row[ColNameBookingServicePaymentOfBookingId],
            +row[ColNameBookingServicePaymentAmount],
            +row[ColNameBookingServicePaymentStatus],
            +row[ColNameBookingServicePaymentRequestTime],
            +row[ColNameBookingServicePaymentUpdateTime]
        );
    }
}

injected(PaymentTransactionDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN, TIMER_TOKEN);

export const PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN = token<PaymentTransactionDataAccessor>("PaymentTransactionDataAccessor");