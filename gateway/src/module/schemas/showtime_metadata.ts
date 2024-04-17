export class ShowtimeMetadata {
    constructor(
        public id: number,
        public movie_name: string,
        public movie_type: string,
        public theater_name: string,
        public screen_name: string,
        public seat_count: number,
        public time_start: number,
        public time_end: number,
    ) { }

    public static fromProto(ShowtimeMetadataProto: any | undefined): ShowtimeMetadata {
        return new ShowtimeMetadata(
            ShowtimeMetadataProto?.id || 0,
            ShowtimeMetadataProto?.movieName || "",
            ShowtimeMetadataProto?.movieType || "",
            ShowtimeMetadataProto?.theaterName || "",
            ShowtimeMetadataProto?.screenName || "",
            ShowtimeMetadataProto?.seatCount || 0,
            ShowtimeMetadataProto?.timeStart || 0,
            ShowtimeMetadataProto?.timeEnd || 0
        );
    }
}