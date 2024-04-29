import { injected, token } from "brandi";
import { Logger } from "winston";
import { PaymentServiceClient } from "../../proto/gen/PaymentService";
import { AuthenticatedUserInformation } from "../../service/utils";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { PAYMENT_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";

export interface PaymentTransactionManagementOperator {
    createPaymentTransaction(
        authenticatedUserInfo: AuthenticatedUserInformation,
        bookingId: number
    ): Promise<string>;
}

export class PaymentTransactionManagementOperatorImpl implements PaymentTransactionManagementOperator {
    constructor(
        private readonly paymentServiceDM: PaymentServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createPaymentTransaction(
        authenticatedUserInfo: AuthenticatedUserInformation,
        bookingId: number
    ): Promise<string> {
        const { error: createPaymentTransactionError, response: createPaymentTransactionResponse } = await promisifyGRPCCall(
            this.paymentServiceDM.createPaymentTransaction.bind(this.paymentServiceDM),
            { userId: authenticatedUserInfo.user.id, bookingId }
        );

        if (createPaymentTransactionError !== null) {
            this.logger.error("failed to call paymentTransaction_service.createPaymentTransaction()", { error: createPaymentTransactionError });
            throw new ErrorWithHTTPCode("failed to create paymentTransaction", getHttpCodeFromGRPCStatus(createPaymentTransactionError.code));
        }

        return createPaymentTransactionResponse?.checkoutUrl as string;
    }
}

injected(
    PaymentTransactionManagementOperatorImpl,
    PAYMENT_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const PAYMENT_TRANSACTION_MANAGEMENT_OPERATOR_TOKEN =
    token<PaymentTransactionManagementOperatorImpl>("PaymentTransactionManagementOperator");