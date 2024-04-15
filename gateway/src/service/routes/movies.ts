import { injected, token } from "brandi";
import express from "express";
import asyncHandler from "express-async-handler";
import { MOVIE_MANAGEMENT_OPERATOR_TOKEN, MovieManagementOperator } from "../../module/movies";
import {
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    AuthMiddlewareFactory,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    ErrorHandlerMiddlewareFactory,
    UPLOAD_FILE_MIDDLEWARE_FACTORY,
    UploadFileMiddlewareFactory,
    checkUserHasUserPermission,
    getCommaSeparatedIdList
} from "../utils";

const MOVIES_MANAGE_ALL_PERMISSION = "movies.manage";

const MOVIES_POSTER_FIELD_UPLOAD_NAME = "poster";
const MOVIES_POSTER_FIELD_UPLOAD_MAX_COUNT = 1;
const MOVIES_IMAGE_LIST_FIELD_UPLOAD_NAME = "image_list";
const MOVIES_IMAGE_LIST_FIELD_UPLOAD_MAX_COUNT = 10;

export function getMoviesRouter(
    movieManagementOperator: MovieManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory,
    uploadFileMiddlewareFactory: UploadFileMiddlewareFactory
): express.Router {
    const router = express.Router();

    const moviesManageAuthMiddleware = authMiddlewareFactory.getAuthMiddleware((authUserInfo) =>
        checkUserHasUserPermission(authUserInfo.userPermissionList, MOVIES_MANAGE_ALL_PERMISSION),
        true
    );

    const moviesUploadMultipleFileMiddleware = uploadFileMiddlewareFactory.getUploadMultipleFileMiddleware([
        { name: MOVIES_POSTER_FIELD_UPLOAD_NAME, maxCount: MOVIES_POSTER_FIELD_UPLOAD_MAX_COUNT },
        { name: MOVIES_IMAGE_LIST_FIELD_UPLOAD_NAME, maxCount: MOVIES_IMAGE_LIST_FIELD_UPLOAD_MAX_COUNT }
    ]);

    router.post(
        "/api/movies",
        moviesManageAuthMiddleware,
        moviesUploadMultipleFileMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const fileList = req.files as any;
                const poster = {
                    imageData: fileList["poster" as any][0].buffer,
                    originalFileName: fileList["poster" as any][0].originalname
                }
                const imageList = fileList["image_list"].map((image: any) => (
                    {
                        imageData: image.buffer,
                        originalFileName: image.originalname
                    }
                ))

                const title = req.body.title as string;
                const description = req.body.description as string;
                const trailer = req.body.trailer as string;
                const duration = +req.body.duration;
                const releaseDate = +req.body.release_date;
                const genreIdList = getCommaSeparatedIdList(req.body.genre_id_list as string);
                const typeIdList = getCommaSeparatedIdList(req.body.type_id_list as string);
                const movie = await movieManagementOperator.createMovie(
                    title,
                    description,
                    duration,
                    releaseDate,
                    genreIdList,
                    typeIdList,
                    trailer,
                    imageList,
                    poster
                );
                res.json(movie);
            }, next);
        })
    );

    router.get(
        "/api/movies/:movieId",
        moviesManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieId = +req.params.movieId;
                const movie = await movieManagementOperator.getMovie(movieId);
                res.json(movie);
            }, next);
        })
    );

    router.get(
        "/api/movies/current-showing",
        moviesManageAuthMiddleware,
        asyncHandler(async (_req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movie = await movieManagementOperator.getCurrentShowingMovieList();
                res.json(movie);
            }, next);
        })
    );

    router.get(
        "/api/movies/upcoming",
        moviesManageAuthMiddleware,
        asyncHandler(async (_req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movie = await movieManagementOperator.getUpcomingMovieList();
                res.json(movie);
            }, next);
        })
    );

    router.delete(
        "/api/movies/:movieId",
        moviesManageAuthMiddleware,
        async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieId = +req.params.movieId;
                await movieManagementOperator.deleteMovie(movieId);
                res.json({});
            }, next);
        });

    return router;
}

injected(
    getMoviesRouter,
    MOVIE_MANAGEMENT_OPERATOR_TOKEN,
    AUTH_MIDDLEWARE_FACTORY_TOKEN,
    ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN,
    UPLOAD_FILE_MIDDLEWARE_FACTORY
);

export const MOVIES_ROUTER_TOKEN = token<express.Router>("MoviesRouter");
