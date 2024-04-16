export class Screen {
    constructor(
        public id: number,
        public of_theater_id: number,
        public of_screen_type_id: number,
        public display_name: string,
    ) { }

    public static fromProto(screenProto: any | undefined): Screen {
        return new Screen(
            screenProto?.id || 0,
            screenProto?.ofTheaterId || 0,
            screenProto?.ofScreenTypeId || 0,
            screenProto?.displayName || "",
        )
    }
}