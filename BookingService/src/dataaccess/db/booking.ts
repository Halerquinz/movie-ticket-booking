import { Knex } from "knex";
import { Logger } from "winston";
import { _BookingStatus_Values } from "../../proto/gen/BookingStatus";
import { ErrorWithStatus, LOGGER_TOKEN, Timer } from "../../utils";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { ApplicationConfig } from "../../config";
import ms from "ms";

export interface CreateBookingArguments {
    ofUserId: number,
    ofShowtimeId: number,
    ofSeatId: number,
    bookingTime: number,
    bookingStatus: BookingStatus,
    expireAt: number,
    amount: number
}

export enum BookingStatus {
    PENDING = 0,
    CONFIRMED = 1,
    CANCEL = 2
}

export class Booking {
    constructor(
        public id: number,
        public ofUserId: number,
        public ofShowtimeId: number,
        public ofSeatId: number,
        public bookingTime: number,
        public expireAt: number,
        public bookingStatus: BookingStatus,
        public amount: number
    ) { }
}
export interface BookingDataAccessor {
    createBooking(args: CreateBookingArguments): Promise<number>;
    updateBooking(booking: Booking): Promise<void>;
    getBookingWithXLock(id: number): Promise<Booking | null>;
    withTransaction<T>(cb: (dataAccessor: BookingDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameBookingServiceBooking = "booking_service_booking_tab";
const ColNameMBookingServiceBookingId = "booking_id";
const ColNameMBookingServiceOfUserId = "of_user_id";
const ColNameMBookingServiceOfShowtimeId = "of_showtime_id";
const ColNameMBookingServiceOfSeatId = "of_seat_id";
const ColNameMBookingServiceBookingTime = "booking_time";
const ColNameMBookingServiceBookingStatus = "booking_status";
const ColNameMBookingServiceBookingAmount = "amount";
const ColNameMBookingServiceBookingExpireAt = "expire_at";

export class BookingDataAccessorImpl implements BookingDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger,
    ) { }

    public async createBooking(args: CreateBookingArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMBookingServiceOfUserId]: args.ofUserId,
                    [ColNameMBookingServiceOfShowtimeId]: args.ofShowtimeId,
                    [ColNameMBookingServiceOfSeatId]: args.ofSeatId,
                    [ColNameMBookingServiceBookingTime]: args.bookingTime,
                    [ColNameMBookingServiceBookingStatus]: args.bookingStatus,
                    [ColNameMBookingServiceBookingExpireAt]: args.expireAt,
                    [ColNameMBookingServiceBookingAmount]: args.amount
                })
                .returning(ColNameMBookingServiceBookingId)
                .into(TabNameBookingServiceBooking);
            return +rows[0][ColNameMBookingServiceBookingId];
        } catch (error) {
            this.logger.error("failed to create booking", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateBooking(booking: Booking): Promise<void> {
        try {
            await this.knex
                .table(TabNameBookingServiceBooking)
                .update({
                    [ColNameMBookingServiceOfUserId]: booking.ofUserId,
                    [ColNameMBookingServiceOfShowtimeId]: booking.ofShowtimeId,
                    [ColNameMBookingServiceBookingTime]: booking.bookingTime,
                    [ColNameMBookingServiceBookingStatus]: booking.bookingStatus,
                })
                .where(ColNameMBookingServiceBookingId, "=", booking.id)
                .into(TabNameBookingServiceBooking);
        } catch (error) {
            this.logger.error("failed to update booking", {
                booking,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBookingWithXLock(id: number): Promise<Booking | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameBookingServiceBooking)
                .where(ColNameMBookingServiceBookingId, "=", id)
                .forUpdate();
            if (rows.length === 0) {
                this.logger.debug("no booking with booking_id found", { bookingId: id });
                return null;
            }
            if (rows.length > 1) {
                this.logger.debug("more than one booking with booking_id found", { bookingId: id });
                throw new ErrorWithStatus(
                    `more than one booking with booking_id ${id} found`,
                    status.INTERNAL
                );
            }
            return this.getBookingFromRow(rows[0]);
        } catch (error) {
            this.logger.error("failed to get booking", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: BookingDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new BookingDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getBookingFromRow(row: Record<string, any>): Booking {
        return new Booking(
            +row[ColNameMBookingServiceBookingId],
            +row[ColNameMBookingServiceOfUserId],
            +row[ColNameMBookingServiceOfShowtimeId],
            +row[ColNameMBookingServiceOfSeatId],
            +row[ColNameMBookingServiceBookingTime],
            +row[ColNameMBookingServiceBookingExpireAt],
            +row[ColNameMBookingServiceBookingStatus],
            +row[ColNameMBookingServiceBookingAmount]
        );
    }
}

injected(BookingDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const BOOKING_ACCESSOR_TOKEN = token<BookingDataAccessor>("BookingDataAccessor"); 