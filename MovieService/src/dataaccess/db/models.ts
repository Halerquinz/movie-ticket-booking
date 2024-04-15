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
        public ofScreenTypeId: number,
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
        public ofScreenId: number,
        public column: number,
        public row: string,
        public no: string,
    ) { }
}

export class Showtime {
    constructor(
        public id: number,
        public ofMovieId: number,
        public ofScreenId: number,
        public timeStart: number,
        public timeEnd: number,
        public showtimeType: _ShowtimeType_Values
    ) { }
}