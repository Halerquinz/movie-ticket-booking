import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import {
    UserPermissionManagementOperator,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN,
} from "../../module/user_permissions";
import { AuthMiddlewareFactory, AUTH_MIDDLEWARE_FACTORY_TOKEN, checkUserHasUserPermission, ErrorHandlerMiddlewareFactory, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN } from "../utils";

const USER_PERMISSIONS_MANAGE_PERMISSION = "user_permissions.manage";

export function getUserPermissionsRouter(
    userPermissionManagementOperator: UserPermissionManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userPermissionsManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, USER_PERMISSIONS_MANAGE_PERMISSION),
        true
    );

    router.post(
        "/api/permissions",
        userPermissionsManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const permissionName = req.body.permission_name as string;
                const description = req.body.description as string;
                const userPermission = await userPermissionManagementOperator.createUserPermission(
                    permissionName,
                    description
                );
                res.json(userPermission);
            }, next);
        })
    );

    router.get(
        "/api/permissions",
        userPermissionsManageAuthMiddleware,
        asyncHandler(async (_req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const userPermissionList = await userPermissionManagementOperator.getUserPermissionList();
                res.json({ user_permission_list: userPermissionList });
            }, next);
        })
    );

    router.patch(
        "/api/permissions/:userPermissionId",
        userPermissionsManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const userPermissionId = +req.params.userPermissionId;
                const permissionName = req.body.permission_name as string;
                const description = req.body.description as string;
                const userPermission = await userPermissionManagementOperator.updateUserPermission(
                    userPermissionId,
                    permissionName,
                    description
                );
                res.json(userPermission);
            }, next);
        })
    );

    router.delete(
        "/api/permissions/:userPermissionId",
        userPermissionsManageAuthMiddleware,
        async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const userPermissionId = +req.params.userPermissionId;
                await userPermissionManagementOperator.deleteUserPermission(userPermissionId);
                res.json({});
            }, next);
        });

    return router;
}

injected(getUserPermissionsRouter, USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);

export const USER_PERMISSIONS_ROUTER_TOKEN = token<express.Router>("UserPermissionsRouter");
