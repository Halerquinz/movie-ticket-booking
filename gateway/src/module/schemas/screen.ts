import { ScreenType } from "../../proto/gen/ScreenType";

export class Screen {
    constructor(
        public id: number,
        public of_theater_id: number,
        public screen_type: ScreenType,
        public display_name: string,
    ) { }

    public static fromProto(screenProto: any | undefined): Screen {
        return new Screen(
            screenProto?.id || 0,
            screenProto?.ofTheaterId || 0,
            screenProto?.screenType || null,
            screenProto?.displayName || "",
        )
    }
}