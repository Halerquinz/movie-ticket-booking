import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { SESSION_MANAGEMENT_OPERATOR_TOKEN, SessionManagementOperator } from "../../module/sessions";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    AuthenticatedUserInformation,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME,
    getCookieOptions
} from "../utils";

export function getSessionsRouter(
    sessionManagementOperator: SessionManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userLoggedInAuthMiddleware = authMiddlewareFactory.getAuthMiddleware(() => true, true);
    const userLoggedInAuthMiddlewareWithoutTokenRefresh = authMiddlewareFactory.getAuthMiddleware(() => true, false);

    router.post("/api/sessions/password",
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const username = req.body.username as string;
                const password = req.body.password as string;
                const { user, token, userRoleList, userPermissionList } = await sessionManagementOperator.loginWithPassword(
                    username,
                    password
                );
                res.cookie(MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME, token, getCookieOptions()).json({
                    user,
                    userRoleList,
                    userPermissionList
                });
            }, next);
        })
    )

    router.get(
        "/api/sessions/user",
        userLoggedInAuthMiddleware,
        asyncHandler(async (_req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const authenticatedUserInformation = res.locals.authenticatedUserInformation as AuthenticatedUserInformation;
                res.json({
                    user: authenticatedUserInformation.user,
                    token: authenticatedUserInformation.token,
                    userRoleList: authenticatedUserInformation.userRoleList,
                    userPermissionList: authenticatedUserInformation.userPermissionList
                })
            }, next);
        })
    );

    router.delete(
        "/api/sessions",
        userLoggedInAuthMiddlewareWithoutTokenRefresh,
        asyncHandler(async (_req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const authenticatedUserInformation = res.locals
                    .authenticatedUserInformation as AuthenticatedUserInformation;
                await sessionManagementOperator.logout(authenticatedUserInformation.token);
                res.clearCookie(MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME).json({});
            }, next);
        })
    );

    return router;
}

injected(getSessionsRouter, SESSION_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);

export const SESSIONS_ROUTER_TOKEN = token<express.Router>("SessionsRouter");