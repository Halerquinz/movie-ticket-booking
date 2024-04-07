import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, ScreenTypeManagementOperator } from "../../module/screen_types";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    checkUserHasUserPermission
} from "../utils";

const SCREEN_TYPES_MANAGE_ALL_PERMISSION = "screen_types.manage";

export function getScreenTypesRouter(
    screenTypeManagementOperator: ScreenTypeManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const screenTypesManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, SCREEN_TYPES_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/screen-types",
        screenTypesManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const displayName = req.body.display_name as string;
                const description = req.body.description as string;
                const seatCount = +req.body.seat_count;
                const rowCount = +req.body.row_count;
                const seatOfRowCount = +req.body.seat_of_row_count;
                const screenType = await screenTypeManagementOperator.createScreenType(
                    displayName,
                    description,
                    seatCount,
                    rowCount,
                    seatOfRowCount
                );

                res.json(screenType);
            }, next);
        })
    );

    router.delete(
        "/api/screen-types/:screenTypeId",
        screenTypesManageAuthMiddleware,
        async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const screenTypeId = +req.params.screenTypeId;
                await screenTypeManagementOperator.deleteScreenType(screenTypeId);
                res.json({});
            }, next)
        });

    return router;
}

injected(getScreenTypesRouter, SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);
export const SCREEN_TYPES_ROUTER_TOKEN = token<express.Router>("ScreenTypesRouter");
