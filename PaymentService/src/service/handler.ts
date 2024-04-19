import { injected, token } from "brandi";
import { PaymentServiceHandlers } from "../proto/gen/PaymentService";
import { ErrorWithStatus } from "../utils";
import { sendUnaryData, status } from "@grpc/grpc-js";


export class PaymentServiceHandlersFactory {
    constructor(
    ) { }

    public getPaymentServiceHandlers(): PaymentServiceHandlers {
        const handler: PaymentServiceHandlers = {
        }

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

injected(PaymentServiceHandlersFactory);

export const PAYMENT_SERVICE_HANDLERS_FACTORY_TOKEN = token<PaymentServiceHandlersFactory>("PaymentServiceHandlersFactory");