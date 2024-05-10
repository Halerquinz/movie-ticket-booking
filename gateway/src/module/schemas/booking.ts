import { Booking as BookingProto } from "../../proto/gen/Booking"

export enum BookingStatus {
    PENDING = 0,
    CONFIRMED = 1,
    CANCEL = 2
}

export class Booking {
    constructor(
        public id: number,
        public of_user_id: number,
        public of_showtime_id: number,
        public of_seat_id: number,
        public booking_time: number,
        public expire_at: number,
        public booking_status: BookingStatus,
        public amount: number
    ) { }

    public static fromProto(bookingProto: BookingProto | undefined | null): Booking {
        return new Booking(
            bookingProto?.id || 0,
            bookingProto?.ofUserId || 0,
            bookingProto?.ofShowtimeId || 0,
            bookingProto?.ofSeatId || 0,
            bookingProto?.bookingTime as number || 0,
            bookingProto?.expireAt as number || 0,
            bookingProto?.bookingStatus as any,
            bookingProto?.amount || 0
        )
    }
}