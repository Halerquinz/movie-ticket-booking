export class UserTag {
    constructor(
        public readonly id: number,
        public readonly username: string,
        public readonly description: string
    ) { }

    public static fromProto(UserTagProto: any | undefined): UserTag {
        return new UserTag(
            UserTagProto?.id || 0,
            UserTagProto?.username || "",
            UserTagProto?.description || "",
        )
    }
}
