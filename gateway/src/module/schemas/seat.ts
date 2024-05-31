import { Seat as SeatProto } from "../../proto/gen/Seat";
import { SeatType } from "./seat_type";

export class Seat {
    constructor(
        public id: number,
        public seat_type: SeatType | null,
        public of_screen_id: number,
        public column: number,
        public row: string,
        public no: string,
    ) { }

    public static fromProto(seatProto: SeatProto | undefined | null): Seat {
        const seatType = SeatType.fromProto(seatProto?.seatType);
        return new Seat(
            seatProto?.id || 0,
            seatType,
            seatProto?.ofScreenId || 0,
            seatProto?.column || 0,
            seatProto?.row || "",
            seatProto?.no || ""
        );
    }
}