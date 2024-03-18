export class UserRole {
    constructor(
        public readonly id: number,
        public readonly username: string,
        public readonly description: string
    ) { }

    public static fromProto(UserRoleProto: any | undefined): UserRole {
        return new UserRole(
            UserRoleProto?.id || 0,
            UserRoleProto?.username || "",
            UserRoleProto?.description || "",
        )
    }
}
