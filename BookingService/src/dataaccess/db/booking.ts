import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../config";

export interface CreateBookingArguments {
    ofUserId: number,
    ofShowtimeId: number,
    ofSeatId: number,
    bookingTime: number,
    bookingStatus: BookingStatus,
    amount: number;
    currency: string;
}

export enum BookingStatus {
    INITIALIZING = 0,
    PENDING = 1,
    CONFIRMED = 2,
    CANCEL = 3
}

export class Booking {
    constructor(
        public id: number,
        public ofUserId: number,
        public ofShowtimeId: number,
        public ofSeatId: number,
        public bookingTime: number,
        public bookingStatus: BookingStatus,
        public amount: number,
        public currency: string
    ) { }
}

export interface BookingDataAccessor {
    createBooking(args: CreateBookingArguments): Promise<number>;
    getBookingById(id: number): Promise<Booking | null>;
    updateBooking(booking: Booking): Promise<void>;
    getBookingWithStatus(id: number, userId: number, bookingStatus: BookingStatus): Promise<Booking | null>;
    getBookingProcessingCount(showtimeId: number, seatId: number): Promise<number>;
    getBookingConfirmedCount(showtimeId: number, seatId: number): Promise<number>;
    getBookingList(userId: number, bookingStatus: BookingStatus, offset: number, limit: number): Promise<Booking[]>;
    getBookingListProcessingAndConfirmedByShowtimeId(showtimeId: number): Promise<Booking[]>;
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
const ColNameBookingServiceBookingCurrency = "currency";

export class BookingDataAccessorImpl implements BookingDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger,
        private readonly applicationConfig: ApplicationConfig
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
                    [ColNameMBookingServiceBookingAmount]: args.amount * this.applicationConfig.multiplier,
                    [ColNameBookingServiceBookingCurrency]: args.currency
                })
                .returning(ColNameMBookingServiceBookingId)
                .into(TabNameBookingServiceBooking);
            return +rows[0][ColNameMBookingServiceBookingId];
        } catch (error) {
            this.logger.error("failed to create booking", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBookingById(id: number): Promise<Booking | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameBookingServiceBooking)
                .where({
                    [ColNameMBookingServiceBookingId]: id
                });
        } catch (error) {
            this.logger.error("failed to get booking by bookingId", {
                id
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found booking with bookingId", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one booking with bookingId", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one booking with bookingId", status.INTERNAL);
        }

        return this.getBookingFromRow(rows[0]);
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

    public async getBookingProcessingCount(showtimeId: number, seatId: number): Promise<number> {
        try {
            const rows = await this.knex
                .count()
                .from(TabNameBookingServiceBooking)
                .where(ColNameMBookingServiceOfShowtimeId, "=", showtimeId)
                .andWhere(ColNameMBookingServiceOfSeatId, "=", seatId)
                .andWhere((qb) => {
                    qb.where(ColNameMBookingServiceBookingStatus, "=", BookingStatus.INITIALIZING)
                        .orWhere(ColNameMBookingServiceBookingStatus, "=", BookingStatus.PENDING);
                });
            return (rows[0] as any)["count"];
        } catch (error) {
            this.logger.error("failed to get booking processing count", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBookingConfirmedCount(showtimeId: number, seatId: number): Promise<number> {
        try {
            const rows = await this.knex
                .count()
                .from(TabNameBookingServiceBooking)
                .where(ColNameMBookingServiceOfShowtimeId, "=", showtimeId)
                .andWhere(ColNameMBookingServiceOfSeatId, "=", seatId)
                .andWhere(ColNameMBookingServiceBookingStatus, "=", BookingStatus.CONFIRMED);
            return (rows[0] as any)["count"];
        } catch (error) {
            this.logger.error("failed to get booking confirmed count", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBookingWithStatus(id: number, userId: number, bookingStatus: BookingStatus): Promise<Booking | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameBookingServiceBooking)
                .where(ColNameMBookingServiceBookingId, "=", id)
                .andWhere(ColNameMBookingServiceOfUserId, "=", userId)
                .andWhere(ColNameMBookingServiceBookingStatus, "=", bookingStatus);
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


    public async getBookingList(
        userId: number,
        bookingStatus: BookingStatus,
        offset: number,
        limit: number
    ): Promise<Booking[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameBookingServiceBooking)
                .where({
                    [ColNameMBookingServiceOfUserId]: userId
                })
                .andWhere({
                    [ColNameMBookingServiceBookingStatus]: bookingStatus
                })
                .orderBy(ColNameMBookingServiceBookingTime, "desc")
                .offset(offset)
                .limit(limit);

            return rows.map((row) => this.getBookingFromRow(row));
        } catch (error) {
            this.logger.error("failed to get booking list", { userId, bookingStatus, offset, limit, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBookingListProcessingAndConfirmedByShowtimeId(showtimeId: number): Promise<Booking[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameBookingServiceBooking)
                .where({
                    [ColNameMBookingServiceOfShowtimeId]: showtimeId
                })
                .andWhere((qb) => {
                    qb.where(ColNameMBookingServiceBookingStatus, "=", BookingStatus.INITIALIZING)
                        .orWhere(ColNameMBookingServiceBookingStatus, "=", BookingStatus.PENDING)
                        .orWhere(ColNameMBookingServiceBookingStatus, "=", BookingStatus.CONFIRMED);
                });

            return rows.map((row) => this.getBookingFromRow(row));
        } catch (error) {
            this.logger.error("failed to get booking list processing and confirmed", { showtimeId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBookingWithXLock(id: number): Promise<Booking | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameBookingServiceBooking)
                .where({
                    [ColNameMBookingServiceBookingId]: id
                })
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
            const txDataAccessor = new BookingDataAccessorImpl(tx, this.logger, this.applicationConfig);
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
            +row[ColNameMBookingServiceBookingStatus],
            +((+row[ColNameMBookingServiceBookingAmount]) / this.applicationConfig.multiplier),
            row[ColNameBookingServiceBookingCurrency]
        );
    }
}

injected(BookingDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN, APPLICATION_CONFIG_TOKEN);

export const BOOKING_DATA_ACCESSOR_TOKEN = token<BookingDataAccessor>("BookingDataAccessor"); 