// import { injected, token } from "brandi";
// import express from "express";
// import asyncHandler from "express-async-handler";
// import { SESSION_MANAGEMENT_OPERATOR_TOKEN, SessionManagementOperator } from "../../module/sessions";
// import {
//     AUTH_MIDDLEWARE_FACTORY_TOKEN,
//     AuthMiddlewareFactory,
//     AuthenticatedUserInformation,
//     ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
//     ErrorHandlerMiddlewareFactory,
//     MOVIE_TICKET_BOOKING_AUTH_COOKIE_NAME,
//     getCookieOptions
// } from "../utils";
// import { BookingManagementOperator } from "../../module/bookings";

// export function getBookingsRouter(
//     bookingManagementOperator: BookingManagementOperator,
//     authMiddlewareFactory: AuthMiddlewareFactory,
//     errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
// ): express.Router {
//     const router = express.Router();

//     const userLoggedInAuthMiddleware = authMiddlewareFactory.getAuthMiddleware(() => true, true);

//     router.post("/api/bookings/",
//         userLoggedInAuthMiddleware,
//         asyncHandler(async (req, res, next) => {
//             errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
//                 const username = req.body.username as string;
//                 const password = req.body.password as string;
//                 const { user, token, userRoleList, userPermissionList } = await sessionManagementOperator.loginWithPassword(
//                     username,
//                     password
//                 );
//             }, next);
//         })
//     )
//     return router;
// }

// injected(getBookingsRouter, SESSION_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);

// export const SESSIONS_ROUTER_TOKEN = token<express.Router>("SessionsRouter");