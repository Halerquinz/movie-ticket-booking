import { _ShowtimeType_Values } from "../../proto/gen/ShowtimeType";

export class MovieGenre {
    constructor(
        public id: number,
        public displayName: string
    ) { }
}

export class MovieType {
    constructor(
        public id: number,
        public displayName: string
    ) { }
}

export class Movie {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public duration: number,
        public releaseDate: number,
        public movieType: MovieType | null,
        public trailer: MovieTrailer | null,
        public poster: MoviePoster | null,
    ) { }
}

export class MovieTrailer {
    constructor(
        public ofMovieId: number,
        public youtubeLinkUrl: string
    ) { }
}

export class MoviePoster {
    constructor(
        public ofMovieId: number,
        public originalFileName: string,
        public originalImageFileName: string,
    ) { }
}

export class MovieImage {
    constructor(
        public id: number,
        public ofMovieId: number,
        public originalFileName: string,
        public originalImageFileName: string,
    ) { }
}

export class Theater {
    constructor(
        public id: number,
        public displayName: string,
        public location: string,
        public screenCount: number,
        public seatCount: number,
    ) { }
}

export class Screen {
    constructor(
        public id: number,
        public ofTheaterId: number,
        public screenType: ScreenType | null,
        public displayName: string
    ) { }
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
}

export enum ShowtimeDayOfTheWeekType {
    MONTOTHIRS = 1,
    FRITOSUN = 2
}
export class ShowtimeDayOfTheWeek {
    constructor(
        public id: ShowtimeDayOfTheWeekType,
        public displayName: string
    ) { }
}

export enum ShowtimeSlotType {
    BEFORE5PM = 1,
    AFTER5PM = 2
}
export class ShowtimeSlot {
    constructor(
        public id: ShowtimeSlotType,
        public displayName: string
    ) { }
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
}

export class SeatType {
    constructor(
        public id: SeatTypeId,
        public displayName: String
    ) { }
}

export enum SeatTypeId {
    NORMAL = 1,
    VIP = 2,
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
}