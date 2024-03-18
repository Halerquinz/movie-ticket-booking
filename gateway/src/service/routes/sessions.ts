import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { SESSION_MANAGEMENT_OPERATOR_TOKEN, SessionManagementOperator } from "../../module/sessions";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    AuthenticatedUserInformation,
    MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME,
    getCookieOptions
} from "../utils";

export function getSessionsRouter(
    sessionManagementOperator: SessionManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userLoggedInAuthMiddleware = authMiddlewareFactory.getAuthMiddleware(() => true, true);
    const userLoggedInAuthMiddlewareWithoutTokenRefresh = authMiddlewareFactory.getAuthMiddleware(() => true, false);

    router.post("/api/sessions/password",
        asyncHandler(async (req, res) => {
            const username = req.body.username as string;
            const password = req.body.password as string;
            const { user, token } = await sessionManagementOperator.loginWithPassword(username, password);
            res.cookie(MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME, token, getCookieOptions()).json({ user });
        })
    )

    router.get(
        "/api/sessions/user",
        userLoggedInAuthMiddleware,
        asyncHandler(async (req, res) => {
            const authenticatedUserInformation = res.locals.authenticatedUserInformation as AuthenticatedUserInformation;
            res.json({
                user: authenticatedUserInformation.user,
                token: authenticatedUserInformation.token
            })
        })
    );

    router.delete(
        "/api/sessions",
        userLoggedInAuthMiddlewareWithoutTokenRefresh,
        asyncHandler(async (_, res) => {
            const authenticatedUserInformation = res.locals
                .authenticatedUserInformation as AuthenticatedUserInformation;
            await sessionManagementOperator.logout(authenticatedUserInformation.token);
            res.clearCookie(MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME).json({});
        })
    );

    return router;
}

injected(getSessionsRouter, SESSION_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN);

export const SESSIONS_ROUTER_TOKEN = token<express.Router>("SessionsRouter");