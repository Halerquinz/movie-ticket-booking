import { Showtime as ShowtimeProto } from "../../proto/gen/movie_service/Showtime";
import { ShowtimeSlot as ShowtimeSlotProto } from "../../proto/gen/movie_service/ShowtimeSlot";
import { ShowtimeDayOfTheWeek as ShowtimeDayOfTheWeekProto } from "../../proto/gen/movie_service/ShowtimeDayOfTheWeek";
import { Seat as SeatProto } from "../../proto/gen/movie_service/Seat";
import { SeatType as SeatTypeProto } from "../../proto/gen/movie_service/SeatType";
import { Price as PriceProto } from "../../proto/gen/movie_service/Price";
import { ScreenType as ScreenTypeProto } from "../../proto/gen/movie_service/ScreenType";
import { Screen as ScreenProto } from "../../proto/gen/movie_service/Screen";
import { Theater as TheaterProto } from "../../proto/gen/movie_service/Theater";
import { MoviePoster } from "../../proto/gen/movie_service/MoviePoster";
import { MovieTrailer } from "../../proto/gen/movie_service/MovieTrailer";
import { Movie as MovieProto } from "../../proto/gen/movie_service/Movie";
import { Booking } from "../../dataaccess/db";

export class ShowtimeSlot {
    constructor(
        public id: number,
        public display_name: string,
    ) { }

    public static fromProto(showtimeSlotProto: ShowtimeSlotProto | undefined | null): ShowtimeSlot {
        return new ShowtimeSlot(
            showtimeSlotProto?.id || 0,
            showtimeSlotProto?.displayName || "",
        );
    }
}

export class ShowtimeDayOfTheWeek {
    constructor(
        public id: number,
        public display_name: string,
    ) { }

    public static fromProto(showtimeDayOfTheWeekProto: ShowtimeDayOfTheWeekProto | undefined | null): ShowtimeDayOfTheWeek {
        return new ShowtimeDayOfTheWeek(
            showtimeDayOfTheWeekProto?.id || 0,
            showtimeDayOfTheWeekProto?.displayName || "",
        );
    }
}

export class Showtime {
    constructor(
        public id: number,
        public ofMovieId: number,
        public ofScreenId: number,
        public timeStart: number,
        public timeEnd: number,
        public showtimeDayOfTheWeek: ShowtimeDayOfTheWeek | null,
        public showtimeSlot: ShowtimeSlot | null
    ) { }

    public static fromProto(showtimeProto: ShowtimeProto | undefined | null): Showtime {
        const showtimeSlot = ShowtimeSlot.fromProto(showtimeProto?.showtimeSlot);
        const showtimeDayOfTheWeek = ShowtimeDayOfTheWeek.fromProto(showtimeProto?.showtimeDayOfTheWeek);

        return new Showtime(
            showtimeProto?.id || 0,
            showtimeProto?.ofMovieId || 0,
            showtimeProto?.ofScreenId || 0,
            showtimeProto?.timeStart as number || 0,
            showtimeProto?.timeEnd as number || 0,
            showtimeDayOfTheWeek,
            showtimeSlot
        );
    }
}

export class SeatType {
    constructor(
        public id: SeatTypeId,
        public displayName: string
    ) { }

    public static fromProto(seatTypeProto: SeatTypeProto | undefined | null): SeatType {
        return new SeatType(
            seatTypeProto?.id || 0,
            seatTypeProto?.displayName || ""
        );
    }
}

export enum SeatTypeId {
    NORMAL = 1,
    VIP = 2,
}

export class Seat {
    constructor(
        public id: number,
        public seatType: SeatType | null,
        public ofScreenId: number,
        public column: number,
        public row: string,
        public no: string,
    ) { }

    public static fromProto(seatProto: SeatProto | undefined | null): Seat {
        const seatType = SeatType.fromProto(seatProto?.seatType);
        return new Seat(
            seatProto?.id || 0,
            seatType,
            seatProto?.ofScreenId || 0,
            seatProto?.column || 0,
            seatProto?.row || "",
            seatProto?.no || ""
        );
    }
}

export class Price {
    constructor(
        public id: number,
        public ofMovieTypeId: number,
        public ofSeatTypeId: number,
        public ofShowtimeSlotId: number,
        public ofShowtimeDayOfTheWeekId: number,
        public price: number
    ) { }

    public static fromProto(priceProto: PriceProto | undefined | null): Price {
        return new Price(
            priceProto?.id || 0,
            priceProto?.ofMovieTypeId || 0,
            priceProto?.ofSeatTypeId || 0,
            priceProto?.ofShowtimeSlotId || 0,
            priceProto?.ofShowtimeDayOfTheWeekId || 0,
            priceProto?.price as number || 0
        );
    }
}

export class MovieType {
    constructor(
        public id: number,
        public display_name: string
    ) { }

    public static fromProto(MovieGenreProto: any | undefined | null): MovieType {
        return new MovieType(
            MovieGenreProto?.id || 0,
            MovieGenreProto?.displayName || "",
        );
    }
}


export class Movie {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public duration: number,
        public releaseDate: number,
        public trailer: MovieTrailer | null,
        public poster: MoviePoster | null,
        public movieType: MovieType | null,
    ) { }

    public static fromProto(movieProto: MovieProto | undefined | null): Movie {
        const movieType = MovieType.fromProto(movieProto?.movieType);
        return new Movie(
            movieProto?.id || 0,
            movieProto?.title || "",
            movieProto?.description || "",
            movieProto?.duration || 0,
            movieProto?.releaseDate as number || 0,
            movieProto?.trailer || null,
            movieProto?.poster || null,
            movieType
        );
    }
}

export class Theater {
    constructor(
        public id: number,
        public displayName: string,
        public location: string,
        public screenCount: number,
        public seatCount: number,
    ) { }

    public static fromProto(theaterProto: TheaterProto | undefined | null): Theater {
        return new Theater(
            theaterProto?.id || 0,
            theaterProto?.displayName || "",
            theaterProto?.location || "",
            theaterProto?.screenCount || 0,
            theaterProto?.seatCount || 0,
        );
    }
}

export class Screen {
    constructor(
        public id: number,
        public ofTheaterId: number,
        public screenType: ScreenType | null,
        public displayName: string
    ) { }

    public static fromProto(screenProto: ScreenProto | undefined | null): Screen {
        const screenType = ScreenType.fromProto(screenProto?.screenType);
        return new Screen(
            screenProto?.id || 0,
            screenProto?.ofTheaterId || 0,
            screenType,
            screenProto?.displayName || ""
        );
    }
}

export class ScreenType {
    constructor(
        public id: number,
        public displayName: string,
        public description: string,
        public seatCount: number,
        public rowCount: number,
        public seatOfRowCount: number
    ) { }

    public static fromProto(screenTypeProto: ScreenTypeProto | undefined | null): ScreenType {
        return new ScreenType(
            screenTypeProto?.id || 0,
            screenTypeProto?.displayName || "",
            screenTypeProto?.description || "",
            screenTypeProto?.seatCount || 0,
            screenTypeProto?.rowCount || 0,
            screenTypeProto?.seatOfRowCount || 0
        );
    }
}

export class BookingMetadata {
    constructor(
        public booking: Booking,
        public theater: Theater,
        public screen: Screen,
        public showtime: Showtime,
        public movie: Movie,
        public seat: Seat
    ) { }
}