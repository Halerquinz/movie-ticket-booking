import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { MOVIE_MANAGEMENT_OPERATOR_TOKEN, MovieManagementOperator } from "../../module/movies";
import { AUTH_MIDDLEWARE_FACTORY_TOKEN, AuthMiddlewareFactory, checkUserHasUserPermission, getCommaSeparatedIdList } from "../utils";

const MOVIES_MANAGE_ALL_PERMISSION = "movies.manage";

export function getMoviesRouter(
    movieManagementOperator: MovieManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory
): express.Router {
    const router = express.Router();

    const moviesManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, MOVIES_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/movies",
        moviesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const title = req.body.title as string;
            const description = req.body.description as string;
            const duration = +req.body.duration;
            const releaseDate = +req.body.release_date;
            const genreIdList = getCommaSeparatedIdList(req.body.genre_id_list as string);
            const movie = await movieManagementOperator.createMovie(
                title,
                description,
                duration,
                releaseDate,
                genreIdList
            );
            res.json(movie);
        })
    );

    router.get(
        "/api/movies/:movieId",
        moviesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const movieId = +req.params.movieId;
            const movie = await movieManagementOperator.getMovie(movieId);
            res.json(movie);
        })
    );

    router.get(
        "/api/movies/current-showing",
        moviesManageAuthMiddleware,
        asyncHandler(async (_req, res) => {
            const movie = await movieManagementOperator.getCurrentShowingMovieList();
            res.json(movie);
        })
    );

    router.get(
        "/api/movies/upcoming",
        moviesManageAuthMiddleware,
        asyncHandler(async (_req, res) => {
            const movie = await movieManagementOperator.getUpcomingMovieList();
            res.json(movie);
        })
    );

    router.delete(
        "/api/movies/:movieId",
        moviesManageAuthMiddleware,
        async (req, res) => {
            const movieId = +req.params.movieId;
            await movieManagementOperator.deleteMovie(movieId);
            res.json({});
        });

    return router;
}

injected(getMoviesRouter, MOVIE_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN);

export const MOVIES_ROUTER_TOKEN = token<express.Router>("MoviesRouter");
