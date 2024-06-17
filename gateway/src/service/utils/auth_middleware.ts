import { Request, RequestHandler } from "express";
import { User, UserPermission, UserRole } from "../../module/schemas";
import asyncHandler from "express-async-handler";
import { ErrorWithHTTPCode } from "../../utils/errors";
import httpStatus from "http-status";
import { SESSION_MANAGEMENT_OPERATOR_TOKEN, SessionManagementOperator } from "../../module/sessions/session_management_operator";
import { getCookieOptions } from "./cookie";
import { injected, token } from "brandi";

export class AuthenticatedUserInformation {
    constructor(
        public readonly user: User,
        public readonly token: string,
        public readonly userRoleList: UserRole[],
        public readonly userPermissionList: UserPermission[],
    ) { }
}

export declare type AuthorizationFunc = (authUserInfo: AuthenticatedUserInformation, request: Request) => boolean;

export interface AuthMiddlewareFactory {
    getAuthMiddleware(authorizationFunc: AuthorizationFunc, shouldRenewToken: boolean): RequestHandler;
}

export const MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME = "MOVIE_TICKET_BOOKING_AUTH";

export class AuthMiddlewareFactoryImpl implements AuthMiddlewareFactory {
    constructor(
        private readonly sessionManagementOperator: SessionManagementOperator
    ) { }

    public getAuthMiddleware(authorizationFunc: AuthorizationFunc, shouldRenewToken: boolean): RequestHandler {
        return asyncHandler(async (req, res, next) => {
            const token = req.cookies[MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME];
            if (token === undefined) {
                throw new ErrorWithHTTPCode("user is not logged in", httpStatus.UNAUTHORIZED);
            }

            let user: User;
            let newToken: string | null;
            let userRoleList: UserRole[];
            let userPermissionList: UserPermission[];

            try {
                const userFromSession = await this.sessionManagementOperator.getUserOfSession(token);
                user = userFromSession.user;
                newToken = userFromSession.newToken;
                userRoleList = userFromSession.userRoleList;
                userPermissionList = userFromSession.userPermissionList;
            } catch (error) {
                if (error instanceof ErrorWithHTTPCode && error.code === httpStatus.UNAUTHORIZED) {
                    res.clearCookie(MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME);
                }
                throw error;
            }

            const authenticatedUserInformation = new AuthenticatedUserInformation(user, token, userRoleList, userPermissionList);

            const isUserAuthorized = authorizationFunc(authenticatedUserInformation, req);
            if (!isUserAuthorized) {
                throw new ErrorWithHTTPCode("user is not authorized to perform the operation", httpStatus.FORBIDDEN);
            }

            res.locals.authenticatedUserInformation = authenticatedUserInformation;
            if (newToken !== null && shouldRenewToken) {
                res.cookie(MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME, newToken, getCookieOptions());
            }

            next();
        });
    }
}

injected(AuthMiddlewareFactoryImpl, SESSION_MANAGEMENT_OPERATOR_TOKEN);

export const AUTH_MIDDLEWARE_FACTORY_TOKEN = token<AuthMiddlewareFactory>("AuthMiddlewareFactory");