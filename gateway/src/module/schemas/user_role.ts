export class UserRole {
    constructor(
        public readonly id: number,
        public readonly display_name: string,
        public readonly description: string
    ) { }

    public static fromProto(UserRoleProto: any | undefined): UserRole {
        return new UserRole(
            UserRoleProto?.id || 0,
            UserRoleProto?.displayName || "",
            UserRoleProto?.description || "",
        )
    }
}
