import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN, MovieImageManagementOperator } from "../../module/movie_images";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    checkUserHasUserPermission,
    multerUploadSingleMiddleware
} from "../utils";

const MOVIE_IMAGES_MANAGE_ALL_PERMISSION = "movie_images.manage";


export function getMovieImagesRouter(
    movieImageManagementOperator: MovieImageManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory
): express.Router {
    const router = express.Router();

    const movieImagesManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, MOVIE_IMAGES_MANAGE_ALL_PERMISSION),
        true
    );

    router.post(
        "/api/movie-images/:movieId",
        movieImagesManageAuthMiddleware,
        multerUploadSingleMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const file = req.file as Express.Multer.File;

                const movieId = +req.params.movieId;
                const originalFileName = file.originalname;
                const imageData = file.buffer;

                const movieImage = await movieImageManagementOperator.createImage(
                    movieId,
                    originalFileName,
                    imageData
                );
                res.json(movieImage);
            }, next);
        })
    );

    router.get(
        "/api/movie-images/:movieId",
        movieImagesManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieId = +req.params.movieId;
                const movieImage = await movieImageManagementOperator.getImage(
                    movieId
                );
                res.json(movieImage);
            }, next);
        })
    );

    router.delete(
        "/api/movie-images/:movieId",
        movieImagesManageAuthMiddleware,
        async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieId = +req.params.movieId;
                await movieImageManagementOperator.deleteImage(movieId);
                res.json({});
            }, next);
        });

    return router;
}

injected(getMovieImagesRouter, MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN, AUTH_MIDDLEWARE_FACTORY_TOKEN, ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN);

export const MOVIE_IMAGES_ROUTER_TOKEN = token<express.Router>("MovieImagesRouter");
