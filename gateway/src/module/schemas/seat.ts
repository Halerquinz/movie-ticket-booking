export class Seat {
    constructor(
        public seat_id: number,
        public of_screen_id: number,
        public row: number,
        public column: number,
        public no: string
    ) { }

    public static fromProto(Seat: any | undefined): Seat {
        return new Seat(
            Seat?.seatId || 0,
            Seat?.ofScreenId || 0,
            Seat?.row || 0,
            Seat?.column || "",
            Seat?.no || ""
        )
    }
}