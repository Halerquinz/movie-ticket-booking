import { Showtime as ShowtimeProto } from "../../proto/gen/Showtime";
import { ShowtimeSlot as ShowtimeSlotProto } from "../../proto/gen/ShowtimeSlot";
import { ShowtimeDayOfTheWeek as ShowtimeDayOfTheWeekProto } from "../../proto/gen/ShowtimeDayOfTheWeek";
import { Seat as SeatProto } from "../../proto/gen/Seat";
import { SeatType as SeatTypeProto } from "../../proto/gen/SeatType";
import { Price as PriceProto } from "../../proto/gen/Price";

export class ShowtimeSlot {
    constructor(
        public id: number,
        public display_name: string,
    ) { }

    public static fromProto(showtimeSlotProto: ShowtimeSlotProto | undefined | null): ShowtimeSlot {
        return new ShowtimeSlot(
            showtimeSlotProto?.id || 0,
            showtimeSlotProto?.displayName || "",
        );
    }
}

export class ShowtimeDayOfTheWeek {
    constructor(
        public id: number,
        public display_name: string,
    ) { }

    public static fromProto(showtimeDayOfTheWeekProto: ShowtimeDayOfTheWeekProto | undefined | null): ShowtimeDayOfTheWeek {
        return new ShowtimeDayOfTheWeek(
            showtimeDayOfTheWeekProto?.id || 0,
            showtimeDayOfTheWeekProto?.displayName || "",
        );
    }
}

export class Showtime {
    constructor(
        public id: number,
        public ofMovieId: number,
        public ofScreenId: number,
        public timeStart: number,
        public timeEnd: number,
        public showtimeDayOfTheWeek: ShowtimeDayOfTheWeek | null,
        public showtimeSlot: ShowtimeSlot | null
    ) { }

    public static fromProto(showtimeProto: ShowtimeProto | undefined | null): Showtime {
        const showtimeSlot = ShowtimeSlot.fromProto(showtimeProto?.showtimeSlot);
        const showtimeDayOfTheWeek = ShowtimeDayOfTheWeek.fromProto(showtimeProto?.showtimeDayOfTheWeek);

        return new Showtime(
            showtimeProto?.id || 0,
            showtimeProto?.ofMovieId || 0,
            showtimeProto?.ofScreenId || 0,
            showtimeProto?.timeStart as number || 0,
            showtimeProto?.timeEnd as number || 0,
            showtimeDayOfTheWeek,
            showtimeSlot
        );
    }
}

export class SeatType {
    constructor(
        public id: SeatTypeId,
        public displayName: String
    ) { }

    public static fromProto(seatTypeProto: SeatTypeProto | undefined | null): SeatType {
        return new SeatType(
            seatTypeProto?.id || 0,
            seatTypeProto?.displayName || ""
        );
    }
}

export enum SeatTypeId {
    NORMAL = 1,
    VIP = 2,
}

export class Seat {
    constructor(
        public id: number,
        public seatType: SeatType | null,
        public ofScreenId: number,
        public column: number,
        public row: string,
        public no: string,
    ) { }

    public static fromProto(seatProto: SeatProto | undefined | null): Seat {
        const seatType = SeatType.fromProto(seatProto?.seatType)
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

export class Price {
    constructor(
        public id: number,
        public ofMovieTypeId: number,
        public ofSeatTypeId: number,
        public ofShowtimeSlotId: number,
        public ofShowtimeDayOfTheWeekId: number,
        public price: number
    ) { }

    public static fromProto(priceProto: PriceProto | undefined | null): Price {
        return new Price(
            priceProto?.id || 0,
            priceProto?.ofMovieTypeId || 0,
            priceProto?.ofSeatTypeId || 0,
            priceProto?.ofShowtimeDayOfTheWeekId || 0,
            priceProto?.price || 0,
            priceProto?.price || 0
        );
    }
}