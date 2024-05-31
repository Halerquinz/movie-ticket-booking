import { SeatMetadata as SeatMetadataProto } from "../../proto/gen/SeatMetadata";
import { _SeatStatus_Values } from "../../proto/gen/SeatStatus";

export class SeatMetadata {
    constructor(
        public id: number,
        public of_screen_id: number,
        public row: string,
        public column: number,
        public no: string,
        public status: _SeatStatus_Values,
        public price: number
    ) { }

    public static fromProto(seatMetadataProto: SeatMetadataProto | undefined): SeatMetadata {
        return new SeatMetadata(
            seatMetadataProto?.id || 0,
            seatMetadataProto?.ofScreenId || 0,
            seatMetadataProto?.row || "",
            seatMetadataProto?.column || 0,
            seatMetadataProto?.no || "",
            seatMetadataProto?.status as any,
            seatMetadataProto?.price || 0
        );
    }
}