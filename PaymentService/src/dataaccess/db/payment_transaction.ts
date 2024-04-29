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
    getPaymentTransactionByBookingIdWithXLock(bookingId: number): Promise<PaymentTransaction | null>;
    getPaymentTransactionByBookingIdWithStatusPending(bookingId: number): Promise<PaymentTransaction | null>;
    countPendingPaymentTransaction(ofBookingId: number): Promise<number>;
    withTransaction<T>(cb: (dataAccessor: PaymentTransactionDataAccessor) => Promise<T>): Promise<T>;
}

const TabNamePaymentServicePaymentTransaction = "payment_service_payment_transaction_tab";
const ColNamePaymentServicePaymentTransactionId = "payment_transaction_id";
const ColNamePaymentServicePaymentTransactionOfBookingId = "of_booking_id";
const ColNamePaymentServicePaymentTransactionAmount = "amount";
const ColNamePaymentServicePaymentTransactionRequestTime = "request_time";
const ColNamePaymentServicePaymentTransactionUpdateTime = "update_time";
const ColNamePaymentServicePaymentTransactionStatus = "status";

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
                    [ColNamePaymentServicePaymentTransactionOfBookingId]: ofBookingId,
                    [ColNamePaymentServicePaymentTransactionAmount]: amount,
                    [ColNamePaymentServicePaymentTransactionStatus]: transactionStatus,
                    [ColNamePaymentServicePaymentTransactionRequestTime]: requestTime,
                    [ColNamePaymentServicePaymentTransactionUpdateTime]: this.timer.getCurrentTime()
                })
                .returning(ColNamePaymentServicePaymentTransactionId)
                .into(TabNamePaymentServicePaymentTransaction);
            return +rows[0][ColNamePaymentServicePaymentTransactionId];
        } catch (error) {
            this.logger.error("failed to create payment transaction", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

    }

    public async updatePaymentTransaction(paymentTransaction: PaymentTransaction): Promise<void> {
        try {
            await this.knex
                .table(TabNamePaymentServicePaymentTransaction)
                .update({
                    [ColNamePaymentServicePaymentTransactionOfBookingId]: paymentTransaction.ofBookingId,
                    [ColNamePaymentServicePaymentTransactionAmount]: paymentTransaction.amount,
                    [ColNamePaymentServicePaymentTransactionStatus]: paymentTransaction.status,
                    [ColNamePaymentServicePaymentTransactionRequestTime]: paymentTransaction.requestTime,
                    [ColNamePaymentServicePaymentTransactionUpdateTime]: this.timer.getCurrentTime()
                })
                .where(ColNamePaymentServicePaymentTransactionId, "=", paymentTransaction.id)
                .into(TabNamePaymentServicePaymentTransaction);
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
                .from(TabNamePaymentServicePaymentTransaction)
                .where(ColNamePaymentServicePaymentTransactionId, "=", id)
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
            return this.getPaymentTransactionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get payment transaction", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getPaymentTransactionByBookingIdWithXLock(bookingId: number): Promise<PaymentTransaction | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNamePaymentServicePaymentTransaction)
                .where(ColNamePaymentServicePaymentTransactionOfBookingId, "=", bookingId)
                .forUpdate();
            if (rows.length === 0) {
                this.logger.debug("no payment transaction with booking_id found", { bookingId: bookingId });
                return null;
            }
            if (rows.length > 1) {
                this.logger.debug("more than one payment transaction with booking_id found", { bookingId: bookingId });
                throw new ErrorWithStatus(
                    `more than one payment transaction with booking_id ${bookingId} found`,
                    status.INTERNAL
                );
            }
            return this.getPaymentTransactionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get payment transaction", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getPaymentTransactionByBookingIdWithStatusPending(bookingId: number): Promise<PaymentTransaction | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNamePaymentServicePaymentTransaction)
                .where(ColNamePaymentServicePaymentTransactionOfBookingId, "=", bookingId)
                .andWhere(ColNamePaymentServicePaymentTransactionStatus, "=", PaymentTransactionStatus.PENDING);
            if (rows.length === 0) {
                this.logger.debug("no payment transaction with booking_id with status pending found", { bookingId: bookingId });
                return null;
            }
            if (rows.length > 1) {
                this.logger.debug("more than one payment transaction with booking_id with status pending found", { bookingId: bookingId });
                throw new ErrorWithStatus(
                    `more than one payment transaction with booking_id ${bookingId} with status pending found`,
                    status.INTERNAL
                );
            }
            return this.getPaymentTransactionFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get payment transaction with status pending", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async countPendingPaymentTransaction(ofBookingId: number): Promise<number> {
        try {
            const rows = await this.knex
                .count()
                .from(TabNamePaymentServicePaymentTransaction)
                .where(ColNamePaymentServicePaymentTransactionOfBookingId, "=", ofBookingId)
                .andWhere(ColNamePaymentServicePaymentTransactionStatus, "=", PaymentTransactionStatus.PENDING);
            return +(rows[0] as any)["count"];
        } catch (error) {
            this.logger.error("failed to get pending payment transaction count of booking_id", {
                ofBookingId,
                error,
            });
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
            +row[ColNamePaymentServicePaymentTransactionId],
            +row[ColNamePaymentServicePaymentTransactionOfBookingId],
            +row[ColNamePaymentServicePaymentTransactionAmount],
            +row[ColNamePaymentServicePaymentTransactionStatus],
            +row[ColNamePaymentServicePaymentTransactionRequestTime],
            +row[ColNamePaymentServicePaymentTransactionUpdateTime]
        );
    }
}

injected(PaymentTransactionDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN, TIMER_TOKEN);

export const PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN = token<PaymentTransactionDataAccessor>("PaymentTransactionDataAccessor");