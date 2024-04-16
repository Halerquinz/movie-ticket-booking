import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    checkUserHasUserPermission
} from "../utils";
import { SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN, SHOWTIME_MANAGEMENT_OPERATOR_TOKEN, ShowtimeListManagementOperator, ShowtimeManagementOperator } from "../../module/showtimes";

const SHOWTIMES_MANAGE_ALL_PERMISSION = "theaters.manage";

export function getShowtimesRouter(
    showtimeManagementOperator: ShowtimeManagementOperator,
    showtimeListManagementOperator: ShowtimeListManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

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
        "/api/showtimes/theater-id/:theaterId/movie-id/:movieId",
        showtimesManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieId = +req.params.movieId;
                const theaterId = +req.params.theaterId;
                const requestTime = +req.body.request_time;
                const showtimeList = await showtimeListManagementOperator.getShowtimeListOfTheaterByMovieId(
                    theaterId,
                    movieId,
                    requestTime
                );
                res.json(showtimeList);
            }, next);
        })
    );

    return router;
}

injected(
    getShowtimesRouter,
    SHOWTIME_MANAGEMENT_OPERATOR_TOKEN,
    SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN,
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
);
export const SHOWTIMES_ROUTER_TOKEN = token<express.Router>("ShowtimesRouter");
