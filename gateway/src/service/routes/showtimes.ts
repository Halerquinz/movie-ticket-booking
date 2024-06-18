import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { SHOWTIME_MANAGEMENT_OPERATOR_TOKEN, ShowtimeManagementOperator } from "../../module/showtimes";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    AuthenticatedUserInformation,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    checkUserHasUserPermission
} from "../utils";
import { BOOKING_MANAGEMENT_OPERATOR_TOKEN, BookingManagementOperator } from "../../module/bookings";

const SHOWTIMES_MANAGE_ALL_PERMISSION = "showtimes.manage";

export function getShowtimesRouter(
    showtimeManagementOperator: ShowtimeManagementOperator,
    bookingManagementOperator: BookingManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userLoggedInAuthMiddleware = authMiddlewareFactory.getAuthMiddleware(() => true, true);
    const showtimesManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, SHOWTIMES_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/showtimes",
        showtimesManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieId = +req.body.movie_id;
                const screenId = +req.body.screen_id;
                const timeStart = +req.body.time_start;
                const showtime = await showtimeManagementOperator.createShowtime(
                    movieId,
                    screenId,
                    timeStart
                );
                res.json(showtime);
            }, next);
        })
    );

    router.get(
        "/api/showtimes/:showtimeId",
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const showtimeId = +req.params.showtimeId;
                const showtimeMetadata = await showtimeManagementOperator.getShowtimeMetadata(
                    showtimeId,
                );
                res.json(showtimeMetadata);
            }, next);
        })
    );

    router.post(
        "/api/showtimes/:showtimeId/bookings",
        userLoggedInAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const authenticatedUserInformation = res.locals
                    .authenticatedUserInformation as AuthenticatedUserInformation;
                const showtimeId = +req.params.showtimeId;
                const amount = +req.body.amount;
                const currency = req.body.currency;
                const seatId = +req.body.seat_id;
                const booking = await bookingManagementOperator.createBooking(
                    authenticatedUserInformation,
                    showtimeId,
                    seatId,
                    amount,
                    currency
                );
                res.json(booking);
            }, next);
        })
    );

    return router;
}

injected(
    getShowtimesRouter,
    SHOWTIME_MANAGEMENT_OPERATOR_TOKEN,
    BOOKING_MANAGEMENT_OPERATOR_TOKEN,
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN
);
export const SHOWTIMES_ROUTER_TOKEN = token<express.Router>("ShowtimesRouter");
