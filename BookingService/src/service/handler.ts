import { injected, token } from "brandi";
import { BookingServiceHandlers } from "../proto/gen/BookingService";
import { ErrorWithStatus } from "../utils";
import { sendUnaryData, status } from "@grpc/grpc-js";
import { BOOKING_MANAGEMENT_OPERATOR_TOKEN, BookingManagementOperator } from "../module/booking";

export class BookingServiceHandlersFactory {
    constructor(
        private readonly bookingManagementOperator: BookingManagementOperator
    ) { }

    public getBookingServiceHandlers(): BookingServiceHandlers {
        const handler: BookingServiceHandlers = {
            CreateBooking: async (call, callback) => {
                const req = call.request;
                if (req.amount === undefined) {
                    return callback({ message: "amount is required", code: status.INVALID_ARGUMENT });
                }
                if (req.currency === undefined) {
                    return callback({ message: "currency is required", code: status.INVALID_ARGUMENT });
                }
                if (req.userId === undefined) {
                    return callback({ message: "user id is required", code: status.INVALID_ARGUMENT });
                }
                if (req.showtimeId === undefined) {
                    return callback({ message: "showtime id is required", code: status.INVALID_ARGUMENT });
                }
                if (req.seatId === undefined) {
                    return callback({ message: "seat id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const booking = await this.bookingManagementOperator.createBooking(
                        req.userId,
                        req.showtimeId,
                        req.seatId,
                        req.amount,
                        req.currency
                    );
                    callback(null, { booking: booking as any });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetBookingById: async (call, callback) => {
                const req = call.request;
                if (req.bookingId === undefined) {
                    return callback({ message: "bookingId is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const booking = await this.bookingManagementOperator.getBooking(req.bookingId);
                    callback(null, { booking: booking as any });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetBookingWithStatus: async (call, callback) => {
                const req = call.request;
                if (req.bookingId === undefined) {
                    return callback({ message: "booking id is required", code: status.INVALID_ARGUMENT });
                }
                if (req.userId === undefined) {
                    return callback({ message: "user id status is required", code: status.INVALID_ARGUMENT });
                }
                if (req.bookingStatus === undefined) {
                    return callback({ message: "booking status is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const booking = await this.bookingManagementOperator.getBookingWithStatus(
                        req.bookingId,
                        req.userId,
                        req.bookingStatus as any
                    );
                    callback(null, { booking: booking as any });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            UpdateBookingStatusFromInitializingToPending: async (call, callback) => {
                const req = call.request;
                if (req.bookingId === undefined) {
                    return callback({ message: "booking id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.bookingManagementOperator.updateBookingStatusFromInitializingToPending(req.bookingId);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetBookingListProcessingAndConfirmedByShowtimeId: async (call, callback) => {
                const req = call.request;
                if (req.showtimeId === undefined) {
                    return callback({ message: "showtime id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const bookingList = await this.bookingManagementOperator.getBookingListProcessingAndConfirmedByShowtimeId(req.showtimeId);
                    callback(null, { bookingList: bookingList as any });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetBookingList: async (call, callback) => {
                const req = call.request;
                if (req.userId === undefined) {
                    return callback({ message: "user id is required", code: status.INVALID_ARGUMENT });
                }
                if (req.limit === undefined) {
                    return callback({ message: "limit id is required", code: status.INVALID_ARGUMENT });
                }
                if (req.bookingStatus === undefined) {
                    return callback({ message: "booking status is required", code: status.INVALID_ARGUMENT }); req.offset = 0;
                }

                if (req.offset === undefined) {
                    req.offset = 0;
                }

                try {
                    const bookingList = await this.bookingManagementOperator.getBookingList(
                        req.userId,
                        req.offset,
                        req.limit,
                        req.bookingStatus as any
                    );
                    callback(null, { bookingList: bookingList as any });
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

injected(BookingServiceHandlersFactory, BOOKING_MANAGEMENT_OPERATOR_TOKEN);

export const BOOKING_SERVICE_HANDLERS_FACTORY_TOKEN = token<BookingServiceHandlersFactory>("BookingServiceHandlersFactory");