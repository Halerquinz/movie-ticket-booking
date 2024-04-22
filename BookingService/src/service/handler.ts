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
                        req.amount
                    );
                    callback(null, { booking: booking as any })
                } catch (error) {
                    this.handleError(error, callback);
                }
            },
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

injected(BookingServiceHandlersFactory, BOOKING_MANAGEMENT_OPERATOR_TOKEN);

export const BOOKING_SERVICE_HANDLERS_FACTORY_TOKEN = token<BookingServiceHandlersFactory>("BookingServiceHandlersFactory");