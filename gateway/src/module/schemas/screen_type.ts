export class ScreenType {
    constructor(
        public id: number,
        public display_name: string,
        public description: string,
        public seat_count: number,
        public row_count: number,
        public seat_of_row_count: number
    ) { }

    public static fromProto(screenTypeProto: any): ScreenType {
        console.log()
        return new ScreenType(
            screenTypeProto?.id || 0,
            screenTypeProto?.displayName || "",
            screenTypeProto?.description || "",
            screenTypeProto?.seatCount || 0,
            screenTypeProto?.rowCount || 0,
            screenTypeProto?.seatOfRowCount || 0,
        )
    }
}
