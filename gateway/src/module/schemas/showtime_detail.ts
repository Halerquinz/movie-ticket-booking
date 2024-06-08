import { MovieType } from "./movie_type";
import { ShowtimeDetail as ShowtimeDetailProto } from "../../proto/gen/ShowtimeDetail";

export class ShowtimeDetail {
    constructor(
        public id: number,
        public movie_name: string,
        public movie_type: MovieType,
        public theater_name: string,
        public screen_name: string,
        public seat_count: number,
        public time_start: number,
        public time_end: number,
    ) { }

    public static fromProto(showtimeDetailProto: ShowtimeDetailProto | undefined): ShowtimeDetail {
        const movieType = MovieType.fromProto(showtimeDetailProto?.movieType);
        return new ShowtimeDetail(
            showtimeDetailProto?.id || 0,
            showtimeDetailProto?.movieName || "",
            movieType,
            showtimeDetailProto?.theaterName || "",
            showtimeDetailProto?.screenName || "",
            showtimeDetailProto?.seatCount || 0,
            showtimeDetailProto?.timeStart || 0 as any,
            showtimeDetailProto?.timeEnd || 0 as any
        );
    }
}