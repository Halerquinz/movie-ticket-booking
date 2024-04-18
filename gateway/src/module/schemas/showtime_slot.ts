export class ShowtimeSlot {
    constructor(
        public id: number,
        public display_name: string,
    ) { }

    public static fromProto(ShowtimeSlotProto: any | undefined): ShowtimeSlot {
        return new ShowtimeSlot(
            ShowtimeSlotProto?.id || 0,
            ShowtimeSlotProto?.displayName || "",
        )
    }
}