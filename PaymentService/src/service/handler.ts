import { injected, token } from "brandi";
import { PaymentServiceHandlers } from "../proto/gen/PaymentService";
import { ErrorWithStatus } from "../utils";
import { sendUnaryData, status } from "@grpc/grpc-js";
import { PaymentTransactionManagementOperator, PAYMENT_TRANSACTION_MANAGEMENT_OPERATOR_TOKEN } from "../module/payment";


export class PaymentServiceHandlersFactory {
    constructor(
        private readonly paymentTransactionManagementOperator: PaymentTransactionManagementOperator
    ) { }

    public getPaymentServiceHandlers(): PaymentServiceHandlers {
        const handler: PaymentServiceHandlers = {
            CreatePaymentTransaction: async (call, callback) => {
                const req = call.request;
                if (req.bookingId === undefined) {
                    return callback({ message: "booking id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.userId === undefined) {
                    return callback({ message: "user id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const checkoutUrl =
                        await this.paymentTransactionManagementOperator.createPaymentTransaction(
                            req.bookingId,
                            req.userId
                        );
                    callback(null, { checkoutUrl });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            CancelPaymentTransaction: async (call, callback) => {
                const req = call.request;
                if (req.bookingId === undefined) {
                    return callback({ message: "booking id is required", code: status.INVALID_ARGUMENT });
                }
                if (req.userId === undefined) {
                    return callback({ message: "user id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.paymentTransactionManagementOperator.cancelPaymentTransaction(req.bookingId, req.userId);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback);
                }
            }
        };

        return handler;
    }

    private handleError(error: unknown, callback: sendUnaryData<any>) {
        if (error instanceof ErrorWithStatus) {
            callback({ message: error.message, code: error.status });
        } else if (error instanceof Error) {
            callback({ message: error.message, code: status.INTERNAL });
        } else {
            callback({ code: status.INTERNAL });
        }
    }
}

injected(PaymentServiceHandlersFactory, PAYMENT_TRANSACTION_MANAGEMENT_OPERATOR_TOKEN);

export const PAYMENT_SERVICE_HANDLERS_FACTORY_TOKEN = token<PaymentServiceHandlersFactory>("PaymentServiceHandlersFactory");