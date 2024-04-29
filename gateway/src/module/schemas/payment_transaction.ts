import { PaymentTransaction as PaymentTransactionProto } from "../../proto/gen/PaymentTransaction";

export enum PaymentTransactionStatus {
    PENDING = 0,
    SUCCESS = 1,
    CANCEL = 2
}

export class PaymentTransaction {
    constructor(
        public id: number,
        public of_booking_id: number,
        public amount: number,
        public status: PaymentTransactionStatus,
        public request_time: number,
        public update_time: number
    ) { }

    public static fromProto(paymentTransactionProto: PaymentTransactionProto | undefined): PaymentTransaction {
        return new PaymentTransaction(
            paymentTransactionProto?.id || 0,
            paymentTransactionProto?.ofBookingId || 0,
            paymentTransactionProto?.amount || 0,
            paymentTransactionProto?.status as any || 0,
            paymentTransactionProto?.requestTime as number || 0,
            paymentTransactionProto?.updateTime as number || 0,
        )
    }
}