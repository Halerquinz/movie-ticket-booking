export class UserPermission {
    constructor(
        public readonly id: number,
        public readonly permission_name: string,
        public readonly description: string
    ) { }

    public static fromProto(UserPermissionProto: any | undefined): UserPermission {
        return new UserPermission(
            UserPermissionProto?.id || 0,
            UserPermissionProto?.permissionName || "",
            UserPermissionProto?.description || "",
        );
    }
}
