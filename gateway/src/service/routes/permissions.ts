import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import {
    UserPermissionManagementOperator,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN,
} from "../../module/user_permissions";
import { AuthMiddlewareFactory, AUTH_MIDDLEWARE_FACTORY_TOKEN, checkUserHasUserPermission } from "../utils";

const USER_PERMISSIONS_MANAGE_PERMISSION = "user_permissions.manage";

export function getUserPermissionsRouter(
    userPermissionManagementOperator: UserPermissionManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userPermissionsManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, USER_PERMISSIONS_MANAGE_PERMISSION),
        true
    );

    router.post(
        "/api/permissions",
        userPermissionsManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const permissionName = req.body.permission_name as string;
            const description = req.body.description as string;
            const userPermission = await userPermissionManagementOperator.createUserPermission(
                permissionName,
                description
            );
            res.json(userPermission);
        })
    );

    router.get(
        "/api/permissions",
        userPermissionsManageAuthMiddleware,
        asyncHandler(async (_req, res) => {
            const userPermissionList = await userPermissionManagementOperator.getUserPermissionList();
            res.json({ user_permission_list: userPermissionList });
        })
    );

    router.patch(
        "/api/permissions/:userPermissionId",
        userPermissionsManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const userPermissionId = +req.params.userPermissionId;
            const permissionName = req.body.permission_name as string;
            const description = req.body.description as string;
            const userPermission = await userPermissionManagementOperator.updateUserPermission(
                userPermissionId,
                permissionName,
                description
            );
            res.json(userPermission);
        })
    );

    router.delete("/api/permissions/:userPermissionId", userPermissionsManageAuthMiddleware, async (req, res) => {
        const userPermissionId = +req.params.userPermissionId;
        await userPermissionManagementOperator.deleteUserPermission(userPermissionId);
        res.json({});
    });

    return router;
}

injected(getUserPermissionsRouter, USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN);

export const USER_PERMISSIONS_ROUTER_TOKEN = token<express.Router>("UserPermissionsRouter");
