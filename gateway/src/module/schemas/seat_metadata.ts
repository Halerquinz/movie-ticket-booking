import { SeatMetadata as SeatMetadataProto } from "../../proto/gen/movie_service/SeatMetadata";
import { _movie_service_SeatStatus_Values } from "../../proto/gen/movie_service/SeatStatus";
import { SeatType } from "./seat_type";

export class SeatMetadata {
    constructor(
        public id: number,
        public seat_type: SeatType,
        public of_screen_id: number,
        public row: string,
        public column: number,
        public no: string,
        public status: _movie_service_SeatStatus_Values,
        public price: number
    ) { }

    public static fromProto(seatMetadataProto: SeatMetadataProto | undefined): SeatMetadata {
        const seatType = SeatType.fromProto(seatMetadataProto?.seatType);
        return new SeatMetadata(
            seatMetadataProto?.id || 0,
            seatType,
            seatMetadataProto?.ofScreenId || 0,
            seatMetadataProto?.row || "",
            seatMetadataProto?.column || 0,
            seatMetadataProto?.no || "",
            seatMetadataProto?.status as any,
            seatMetadataProto?.price || 0 as any
        );
    }
}