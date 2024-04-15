export class Theater {
    constructor(
        public id: number,
        public display_name: string,
        public location: string,
        public screen_count: number,
        public seat_count: number,
    ) { }

    public static fromProto(theaterProto: any | undefined): Theater {
        return new Theater(
            theaterProto?.id || 0,
            theaterProto?.displayName || "",
            theaterProto?.location || "",
            theaterProto?.screenCount || 0,
            theaterProto?.seatCount || 0,
        )
    }
} 