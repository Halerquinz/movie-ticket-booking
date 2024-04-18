export class ShowtimeDayOfTheWeek {
    constructor(
        public id: number,
        public display_name: string,
    ) { }

    public static fromProto(ShowtimeDayOfTheWeekProto: any | undefined): ShowtimeDayOfTheWeek {
        return new ShowtimeDayOfTheWeek(
            ShowtimeDayOfTheWeekProto?.id || 0,
            ShowtimeDayOfTheWeekProto?.displayName || "",
        )
    }
}