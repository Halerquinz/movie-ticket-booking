export class User {
    constructor(
        public readonly id: number,
        public readonly username: string,
        public readonly display_name: string
    ) { }

    public static fromProto(UserProto: any | undefined): User {
        return new User(
            UserProto?.id || 0,
            UserProto?.username || "",
            UserProto?.displayName || "",
        );
    }
}
