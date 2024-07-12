import { BookingMetadata as BookingMetadataProto } from "../../proto/gen/booking_service/BookingMetadata";
import { Booking } from "./booking";
import { Movie } from "./movie";
import { Screen } from "./screen";
import { Seat } from "./seat";
import { Showtime } from "./showtime";
import { Theater } from "./theater";

export class BookingMetadata {
    constructor(
        public booking: Booking,
        public theater: Theater,
        public screen: Screen,
        public showtime: Showtime,
        public movie: Movie,
        public seat: Seat
    ) { }

    public static fromProto(bookingMetadataProto: BookingMetadataProto | undefined): BookingMetadata {
        const booking = Booking.fromProto(bookingMetadataProto?.booking);
        const theater = Theater.fromProto(bookingMetadataProto?.theater);
        const showtime = Showtime.fromProto(bookingMetadataProto?.showtime);
        const movie = Movie.fromProto(bookingMetadataProto?.movie);
        const screen = Screen.fromProto(bookingMetadataProto?.screen);
        const seat = Seat.fromProto(bookingMetadataProto?.seat);

        return new BookingMetadata(
            booking,
            theater,
            screen,
            showtime,
            movie,
            seat
        );
    }
}
