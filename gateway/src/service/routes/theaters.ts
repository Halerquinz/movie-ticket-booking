import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { THEATER_MANAGEMENT_OPERATOR_TOKEN, TheaterManagementOperator } from "../../module/theaters";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    checkUserHasUserPermission
} from "../utils";
import { SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN, ShowtimeListManagementOperator } from "../../module/showtimes";

const THEATERS_MANAGE_ALL_PERMISSION = "theaters.manage";

export function getTheatersRouter(
    theaterManagementOperator: TheaterManagementOperator,
    showtimeListManagementOperator: ShowtimeListManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const theatersManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, THEATERS_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/theaters",
        theatersManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const displayName = req.body.display_name as string;
                const location = req.body.location as string;
                const theater = await theaterManagementOperator.createTheater(
                    displayName,
                    location
                );
                res.json(theater);
            }, next);
        })
    );

    router.delete(
        "/api/theaters/:theaterId",
        theatersManageAuthMiddleware,
        async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const theaterId = +req.params.theaterId;
                await theaterManagementOperator.deleteTheater(theaterId);
                res.json({});
            }, next)
        });

    router.get(
        "/api/theaters/:theaterId/showtimes",
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const theaterId = +req.params.theaterId;
                const requestTime = +req.body.request_time;
                const showtimeList = await showtimeListManagementOperator.getShowtimeListOfTheater(
                    theaterId,
                    requestTime
                );
                res.json(showtimeList);
            }, next);
        }));

    router.get(
        "/api/theaters/:theaterId/showtimes/movie/:movieId",
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
    getTheatersRouter,
    THEATER_MANAGEMENT_OPERATOR_TOKEN,
    SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN,
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);
export const THEATERS_ROUTER_TOKEN = token<express.Router>("TheatersRouter");
