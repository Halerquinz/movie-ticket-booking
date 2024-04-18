import { ShowtimeSlot } from "./showtime_slot";
import { ShowtimeDayOfTheWeek } from "./showtime_day_of_the_week";

export class Showtime {
    constructor(
        public id: number,
        public of_movie_id: number,
        public of_screen_id: number,
        public time_start: number,
        public time_end: number,
        public showtime_slot: ShowtimeSlot,
        public showtime_day_of_the_week: ShowtimeDayOfTheWeek
    ) { }

    public static fromProto(ShowtimeProto: any | undefined): Showtime {
        return new Showtime(
            ShowtimeProto?.id || 0,
            ShowtimeProto?.ofMovieId || 0,
            ShowtimeProto?.ofScreenId || 0,
            ShowtimeProto?.timeStart || 0,
            ShowtimeProto?.timeEnd || 0,
            ShowtimeProto?.showtimeSlot || null,
            ShowtimeProto?.showtimeDayOfTheWeek || null,
        )
    }
}