export class Showtime {
    constructor(
        public id: number,
        public of_movie_id: number,
        public of_screen_id: number,
        public time_start: number,
        public time_end: number,
    ) { }

    public static fromProto(ShowtimeProto: any | undefined): Showtime {
        return new Showtime(
            ShowtimeProto?.id || 0,
            ShowtimeProto?.of_movie_id || 0,
            ShowtimeProto?.of_screen_id || 0,
            ShowtimeProto?.time_start || 0,
            ShowtimeProto?.time_end || 0,
        )
    }
}