import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN, MoviePosterManagementOperator } from "../../module/movie_poster";
import { AUTH_MIDDLEWARE_FACTORY_TOKEN, AuthMiddlewareFactory, checkUserHasUserPermission } from "../utils";

const MOVIE_POSTERS_MANAGE_ALL_PERMISSION = "movie_posters.manage";

export function getMoviePostersRouter(
    moviePosterManagementOperator: MoviePosterManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory
): express.Router {
    const router = express.Router();

    const moviePostersManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, MOVIE_POSTERS_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/movie-posters/:movieId",
        moviePostersManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const fileList = req.files as Express.Multer.File[];

            const movieId = +req.params.movieId;
            const originalFileName = fileList[0].originalname;
            const imageData = fileList[0].buffer;

            const moviePoster = await moviePosterManagementOperator.createPoster(
                movieId,
                originalFileName,
                imageData
            );
            res.json(moviePoster);
        })
    );

    router.get(
        "/api/movie-posters/:movieId",
        moviePostersManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const movieId = +req.params.movieId;
            const moviePoster = await moviePosterManagementOperator.getPoster(
                movieId
            );
            res.json(moviePoster);
        })
    );

    router.delete(
        "/api/movie-posters/:movieId",
        moviePostersManageAuthMiddleware,
        async (req, res) => {
            const movieId = +req.params.movieId;
            await moviePosterManagementOperator.deletePoster(movieId);
            res.json({});
        });

    return router;
}

injected(getMoviePostersRouter, MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN);

export const MOVIE_POSTERS_ROUTER_TOKEN = token<express.Router>("MoviePostersRouter");
