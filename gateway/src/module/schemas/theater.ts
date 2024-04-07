export class Theater {
    constructor(
        public theater_id: number,
        public display_name: string,
        public location: string,
        public screen_count: number,
        public seat_count: number,
    ) { }

    public static fromProto(theaterProto: any | undefined): Theater {
        return new Theater(
            theaterProto?.theaterId || 0,
            theaterProto?.displayName || "",
            theaterProto?.location || "",
            theaterProto?.screenCount || 0,
            theaterProto?.seatCount || 0,
        )
    }
} 