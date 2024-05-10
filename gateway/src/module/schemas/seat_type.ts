import { SeatType as SeatTypeProto } from "../../proto/gen/SeatType";

export class SeatType {
    constructor(
        public id: number,
        public display_name: string
    ) { }

    public static fromProto(seatTypeProto: SeatTypeProto | undefined | null): SeatType {
        return new SeatType(
            seatTypeProto?.id || 0,
            seatTypeProto?.displayName || ""
        );
    }
}