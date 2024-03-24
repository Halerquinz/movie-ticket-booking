import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import {
    UserPermissionManagementOperator,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN,
} from "../../module/user_permissions";
import { UserRoleManagementOperator, USER_ROLE_MANAGEMENT_OPERATOR_TOKEN } from "../../module/user_roles";
import { AuthMiddlewareFactory, AUTH_MIDDLEWARE_FACTORY_TOKEN, checkUserHasUserPermission } from "../utils";

const USER_ROLES_MANAGE_PERMISSION = "user_roles.manage";

export function getUserRolesRouter(
    userRoleManagementOperator: UserRoleManagementOperator,
    userPermissionManagementOperator: UserPermissionManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userRolesManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware(
        (authUserInfo) => checkUserHasUserPermission(authUserInfo.userPermissionList, USER_ROLES_MANAGE_PERMISSION),
        true
    );

    router.post(
        "/api/roles",
        userRolesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const displayName = req.body.display_name as string;
            const description = req.body.description as string;
            const userRole = await userRoleManagementOperator.createUserRole(displayName, description);
            res.json(userRole);
        })
    );

    router.patch(
        "/api/roles/:userRoleId",
        userRolesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const userRoleId = +req.params.userRoleId;
            const displayName = req.body.display_name as string | undefined;
            const description = req.body.description as string | undefined;
            const userRole = await userRoleManagementOperator.updateUserRole(userRoleId, displayName, description);
            res.json(userRole);
        })
    );

    router.delete(
        "/api/roles/:userRoleId",
        userRolesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const userRoleId = +req.params.userRoleId;
            await userRoleManagementOperator.deleteUserRole(userRoleId);
            res.json({});
        })
    );

    router.post(
        "/api/roles/:userRoleId/permissions",
        userRolesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const userRoleId = +req.params.userRoleId;
            const userPermissionId = +req.body.user_permission_id;
            await userPermissionManagementOperator.addUserPermissionToUserRole(userRoleId, userPermissionId);
            res.json({});
        })
    );

    router.delete(
        "/api/roles/:userRoleId/permissions/:userPermissionId",
        userRolesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const userRoleId = +req.params.userRoleId;
            const userPermissionId = +req.params.userPermissionId;
            await userPermissionManagementOperator.removeUserPermissionFromUserRole(userRoleId, userPermissionId);
            res.json({});
        })
    );

    return router;
}

injected(
    getUserRolesRouter,
    USER_ROLE_MANAGEMENT_OPERATOR_TOKEN,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN,
    AUTH_MIDDLEWARE_FACTORY_TOKEN
);

export const USER_ROLES_ROUTER_TOKEN = token<express.Router>("UserRolesRouter");
