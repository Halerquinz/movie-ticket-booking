import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { SCREEN_MANAGEMENT_OPERATOR_TOKEN, ScreenManagementOperator } from "../../module/screens";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    checkUserHasUserPermission
} from "../utils";

const SCREENS_MANAGE_ALL_PERMISSION = "screens.manage";

export function getScreensRouter(
    screenManagementOperator: ScreenManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const screensManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, SCREENS_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/screens",
        screensManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const theaterId = +req.body.theater_id;
                const screenTypeId = +req.body.screen_type_id;
                const displayName = req.body.display_name as string;
                const screen = await screenManagementOperator.createScreen(
                    theaterId,
                    screenTypeId,
                    displayName
                );
                res.json(screen);
            }, next);
        })
    );

    router.delete(
        "/api/screens/:screenId",
        screensManageAuthMiddleware,
        async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const screenId = +req.params.screenId;
                await screenManagementOperator.deleteScreen(screenId);
                res.json({});
            }, next);
        });

    return router;
}

injected(getScreensRouter, SCREEN_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);
export const SCREENS_ROUTER_TOKEN = token<express.Router>("ScreensRouter");
