import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { MOVIE_GENRE_MANAGEMENT_OPERATOR_TOKEN, MovieGenreManagementOperator } from "../../module/movie_genres";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    checkUserHasUserPermission
} from "../utils";

const MOVIE_GENRES_MANAGE_ALL_PERMISSION = "movie_genres.manage";

export function getMovieGenresRouter(
    movieGenreManagementOperator: MovieGenreManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const movieGenresManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, MOVIE_GENRES_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/movie-genres",
        movieGenresManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                console.log("body", req.body);
                const displayName = req.body.display_name as string;
                const movieGenre = await movieGenreManagementOperator.createMovieGenre(
                    displayName
                );
                res.json(movieGenre);
            }, next);
        })
    );

    router.patch(
        "/api/movie-genres/:movieGenreId",
        movieGenresManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieGenreId = +req.params.movieGenreId;
                const displayName = req.body.display_name as string;
                const movieGenre = await movieGenreManagementOperator.updateMovieGenre(
                    movieGenreId,
                    displayName
                );
                res.json(movieGenre);
            }, next);
        })
    );

    router.delete(
        "/api/movie-genres/:movieGenreId",
        movieGenresManageAuthMiddleware,
        async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieGenreId = +req.params.movieGenreId;
                await movieGenreManagementOperator.deleteMovieGenre(movieGenreId);
                res.json({});
            }, next)
        });

    return router;
}

injected(getMovieGenresRouter, MOVIE_GENRE_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);

export const MOVIE_GENRES_ROUTER_TOKEN = token<express.Router>("MovieGenresRouter");
