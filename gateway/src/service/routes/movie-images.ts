import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN, MovieImageManagementOperator } from "../../module/movie_images";
import { AUTH_MIDDLEWARE_FACTORY_TOKEN, AuthMiddlewareFactory, checkUserHasUserPermission } from "../utils";

const MOVIE_IMAGES_MANAGE_ALL_PERMISSION = "movie_images.manage";

export function getMovieImagesRouter(
    movieImageManagementOperator: MovieImageManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory
): express.Router {
    const router = express.Router();

    const movieImagesManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, MOVIE_IMAGES_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/movie-images/:movieId",
        movieImagesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const fileList = req.files as Express.Multer.File[];

            const movieId = +req.params.movieId;
            const originalFileName = fileList[0].originalname;
            const imageData = fileList[0].buffer;

            const movieImage = await movieImageManagementOperator.createImage(
                movieId,
                originalFileName,
                imageData
            );
            res.json(movieImage);
        })
    );

    router.get(
        "/api/movie-images/:movieId",
        movieImagesManageAuthMiddleware,
        asyncHandler(async (req, res) => {
            const movieId = +req.params.movieId;
            const movieImage = await movieImageManagementOperator.getImage(
                movieId
            );
            res.json(movieImage);
        })
    );

    router.delete(
        "/api/movie-images/:movieId",
        movieImagesManageAuthMiddleware,
        async (req, res) => {
            const movieId = +req.params.movieId;
            await movieImageManagementOperator.deleteImage(movieId);
            res.json({});
        });

    return router;
}

injected(getMovieImagesRouter, MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN);

export const MOVIE_IMAGES_ROUTER_TOKEN = token<express.Router>("MovieImagesRouter");
