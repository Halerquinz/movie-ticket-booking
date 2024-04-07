import { _BookingStatus_Values } from "../../proto/gen/BookingStatus";

export class Booking {
    constructor(
        public bookingId: number,
        public ofUserId: number,
        public ofShowtimeId: number,
        public bookingTime: number,
        public bookingStatus: _BookingStatus_Values
    ) { }
}

export class BookingSeat {
    constructor(
        public ofBookingId: number,
        public ofSeatId: number,
    ) { }
}

export class Payment {
    constructor(
        public paymentId: number,
        public ofBookingId: number,
        public amount: number,
        public paymentMethod: number,
        public paymentTime: number,
        public paymentStatus: _BookingStatus_Values,
    ) { }
}

