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

    public static fromProto(BookingProto: any | undefined): Booking {
        return new Booking(
            BookingProto?.id || 0,
            BookingProto?.ofUserId || "",
            BookingProto?.ofShowtimeId || "",
            BookingProto?.ofSeatId || 0,
            BookingProto?.bookingTime || 0,
            BookingProto?.expireAt || null,
            BookingProto?.bookingStatus || null,
            BookingProto?.amount || null
        )
    }
}