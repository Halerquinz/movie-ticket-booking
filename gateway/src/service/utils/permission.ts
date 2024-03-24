import { UserPermission } from "../../module/schemas";

export function checkUserHasUserPermission(userPermissionList: UserPermission[], permissionName: string): boolean {
    return userPermissionList.find(
        (userPermission) => userPermission.permission_name === permissionName
    ) !== undefined;
}
