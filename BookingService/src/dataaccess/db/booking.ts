import { Knex } from "knex";
import { Logger } from "winston";
import { _BookingStatus_Values } from "../../proto/gen/BookingStatus";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export interface CreateBookingArguments {
    ofUserId: number,
    ofShowtimeId: number,
    bookingTime: number,
    bookingStatus: _BookingStatus_Values
}
export interface BookingDataAccessor {
    createBooking(args: CreateBookingArguments): Promise<number>;
}

const TabNameBookingServiceBooking = "booking_service_booking_tab";
const ColNameMBookingServiceBookingId = "booking_id";
const ColNameMBookingServiceOfUserId = "of_user_id";
const ColNameMBookingServiceOfShowtimeId = "of_showtime_id";
const ColNameMBookingServiceBookingTime = "booking_time";
const ColNameMBookingServiceBookingStatus = "booking_status";

export class BookingDataAccessorImpl implements BookingDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createBooking(args: CreateBookingArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMBookingServiceOfUserId]: args.ofUserId,
                    [ColNameMBookingServiceOfShowtimeId]: args.ofShowtimeId,
                    [ColNameMBookingServiceBookingTime]: args.bookingTime,
                    [ColNameMBookingServiceBookingStatus]: args.bookingStatus,
                })
                .returning(ColNameMBookingServiceBookingId)
                .into(TabNameBookingServiceBooking);
            return +rows[0][ColNameMBookingServiceBookingId];
        } catch (error) {
            this.logger.error("failed to create booking", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }
}

injected(BookingDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const BOOKING_ACCESSOR_TOKEN = token<BookingDataAccessor>("BookingDataAccessor"); 