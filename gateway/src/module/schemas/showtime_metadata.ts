import { ShowtimeMetadata as ShowtimeMetadataProto } from "../../proto/gen/ShowtimeMetadata";
import { Movie } from "./movie";
import { SeatMetadata } from "./seat_metadata";
import { Showtime } from "./showtime";
import { Theater } from "./theater";
import { Screen } from "./screen";

export class ShowtimeMetadata {
    constructor(
        public theater: Theater,
        public showtime: Showtime,
        public movie: Movie,
        public screen: Screen,
        public seats: SeatMetadata[],
    ) { }

    public static fromProto(showtimeMetadataProto: ShowtimeMetadataProto | undefined): ShowtimeMetadata {
        const theater = Theater.fromProto(showtimeMetadataProto?.theater);
        const showtime = Showtime.fromProto(showtimeMetadataProto?.showtime);
        const movie = Movie.fromProto(showtimeMetadataProto?.movie);
        const screen = Screen.fromProto(showtimeMetadataProto?.screen);
        const seats = showtimeMetadataProto?.seats?.map((seat) => SeatMetadata.fromProto(seat));

        return new ShowtimeMetadata(
            theater,
            showtime,
            movie,
            screen,
            seats!
        );
    }
}