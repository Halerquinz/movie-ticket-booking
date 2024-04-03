import { SeatStatus } from "./seat";
import { ShowtimeType } from "./showtime";

export class MovieGenre {
    constructor(
        public movieGenreId: number,
        public displayName: string
    ) { }
}

export class Movie {
    constructor(
        public movieId: number,
        public title: string,
        public description: string,
        public duration: number,
        public releaseDate: number,
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
        public thumbnailImageFileName: string
    ) { }
}

export class MovieImage {
    constructor(
        public imageId: number,
        public ofMovieId: number,
        public originalFileName: string,
        public originalImageFileName: string,
        public thumbnailImageFileName: string
    ) { }
}

export class Theater {
    constructor(
        public theaterId: number,
        public name: string,
        public location: string,
        public screenCount: number,
        public seatCount: number,
    ) { }
}

export class Screen {
    constructor(
        public screenId: number,
        public ofTheaterId: number,
        public ofScreenTypeId: number,
    ) { }
}

export class ScreenType {
    constructor(
        public screenTypeId: number,
        public name: string,
        public description: string,
        public seatCount: number
    ) { }
}

export class Seat {
    constructor(
        public seatId: number,
        public ofScreenId: number,
        public column: number,
        public row: string,
        public no: string,
        public status: SeatStatus,
    ) { }
}

export class Showtime {
    constructor(
        public showtimeId: number,
        public ofMovieId: number,
        public ofScreenId: number,
        public timeStart: string,
        public timeEnd: string,
        public showtimeType: ShowtimeType
    ) { }
}