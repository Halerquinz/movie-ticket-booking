import { injected, token } from "brandi";
import { Logger } from "winston";
import { BOOKING_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { BookingServiceClient } from "../../proto/gen/BookingService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { AuthenticatedUserInformation } from "../../service/utils";
import { Booking, BookingMetadata, BookingStatus } from "../schemas";
import { POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN, PosterProtoToPosterConverter } from "../schemas/converters";
import { BookingMetadata as BookingMetadataProto } from "../../proto/gen/BookingMetadata";

export interface BookingManagementOperator {
    createBooking(
        authenticatedUserInfo: AuthenticatedUserInformation,
        showtimeId: number,
        seatId: number,
        amount: number,
    ): Promise<Booking>;
    getBookingList(
        authenticatedUserInfo: AuthenticatedUserInformation,
        offset: number,
        limit: number,
        bookingStatus: BookingStatus
    ): Promise<BookingMetadata[]>;
}

export class BookingManagementOperatorImpl implements BookingManagementOperator {
    constructor(
        private readonly bookingServiceDM: BookingServiceClient,
        private readonly logger: Logger,
        private readonly posterProtoToPosterConverter: PosterProtoToPosterConverter,
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

    public async getBookingList(
        authenticatedUserInfo: AuthenticatedUserInformation,
        offset: number,
        limit: number,
        bookingStatus: BookingStatus
    ): Promise<BookingMetadata[]> {
        const { error: getBookingListError, response: getBookingListResponse } = await promisifyGRPCCall(
            this.bookingServiceDM.getBookingList.bind(this.bookingServiceDM),
            { userId: authenticatedUserInfo.user.id, bookingStatus, limit, offset }
        );

        if (getBookingListError !== null) {
            this.logger.error("failed to call booking_service.getBookingList()", { error: getBookingListError });
            throw new ErrorWithHTTPCode("failed to get booking list", getHttpCodeFromGRPCStatus(getBookingListError.code));
        }

        if (getBookingListResponse?.bookingList === undefined) return [];

        let bookingListProto = getBookingListResponse.bookingList as any;
        bookingListProto = await Promise.all(
            bookingListProto.map(async (bookingMetadataProto: any) => {
                bookingMetadataProto.movie.poster =
                    await this.posterProtoToPosterConverter.convert(bookingMetadataProto.movie.poster);
                return bookingMetadataProto;
            }));

        return bookingListProto.map(
            (bookingeMetadataProto: BookingMetadataProto) => BookingMetadata.fromProto(bookingeMetadataProto)
        ) || [];
    }
}

injected(
    BookingManagementOperatorImpl,
    BOOKING_SERVICE_DM_TOKEN,
    LOGGER_TOKEN,
    POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN
);

export const BOOKING_MANAGEMENT_OPERATOR_TOKEN = token<BookingManagementOperatorImpl>("BookingManagementOperator");