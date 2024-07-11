import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { USER_MANAGEMENT_OPERATOR_TOKEN, UserManagementOperator } from "../../module/users";
import { AUTH_MIDDLEWARE_FACTORY_TOKEN, AuthMiddlewareFactory, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN, ErrorHandlerMiddlewareFactory } from "../utils";

export function getUsersRouter(
    userManagementOperator: UserManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userLoggedInAuthMiddleware = authMiddlewareFactory.getAuthMiddleware(() => true, true);

    router.post("/api/users",
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const username = req.body.username as string;
                const displayName = req.body.display_name as string;
                const email = req.body.email as string;
                const password = req.body.password as string;
                const user = await userManagementOperator.createUser(username, displayName, password, email);
                res.json(user);
            }, next);
        })
    );

    router.patch(
        "/api/users/:userId",
        userLoggedInAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const userId = +req.params.userId;
                const username = req.body.username as string | undefined;
                const displayName = req.body.display_name as string | undefined;
                const password = req.body.password as string | undefined;
                const user = await userManagementOperator.updateUser(userId, username, displayName, password);
                res.json(user);
            }, next);
        })
    );

    return router;
}

injected(getUsersRouter, USER_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);

export const USERS_ROUTER_TOKEN = token<express.Router>("UsersRouter");