import { injected, token } from "brandi";
import { Logger } from "winston";
import { BOOKING_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { BookingServiceClient } from "../../proto/gen/BookingService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { AuthenticatedUserInformation } from "../../service/utils";
import { Booking } from "../schemas";

export interface BookingManagementOperator {
    createBooking(
        authenticatedUserInfo: AuthenticatedUserInformation,
        showtimeId: number,
        seatId: number,
        amount: number,
    ): Promise<Booking>;
}

export class BookingManagementOperatorImpl implements BookingManagementOperator {
    constructor(
        private readonly bookingServiceDM: BookingServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createBooking(
        authenticatedUserInfo: AuthenticatedUserInformation,
        showtimeId: number,
        seatId: number,
        amount: number
    ): Promise<Booking> {
        const { error: createBookingError, response: createBookingResponse } = await promisifyGRPCCall(
            this.bookingServiceDM.createBooking.bind(this.bookingServiceDM),
            { userId: authenticatedUserInfo.user.id, amount, seatId, showtimeId }
        );

        if (createBookingError !== null) {
            this.logger.error("failed to call booking_service.createBooking()", { error: createBookingError });
            throw new ErrorWithHTTPCode("failed to create booking", getHttpCodeFromGRPCStatus(createBookingError.code));
        }

        return Booking.fromProto(createBookingResponse?.booking);
    }
}

injected(
    BookingManagementOperatorImpl,
    BOOKING_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const BOOKING_MANAGEMENT_OPERATOR_TOKEN = token<BookingManagementOperatorImpl>("BookingManagementOperator");