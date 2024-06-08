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
const DEFAULT_GET_MOVIE_LIST_LIMIT = 10;
const DEFAULT_GET_UPCOMING_MOVIE_LIST_LIMIT = 5;
const DEFAULT_GET_CURRENT_SHOWING_MOVIE_LIST_LIMIT = 5;


export function getMoviesRouter(
    movieManagementOperator: MovieManagementOperator,
    authMiddlewareFactory: AuthMiddlewareFactory,
    errorHandlerMiddlewareFactory: ErrorHandlerMiddlewareFactory,
    uploadFileMiddlewareFactory: UploadFileMiddlewareFactory
): express.Router {
    const router = express.Router();

    const userLoggedInAuthMiddleware = authMiddlewareFactory.getAuthMiddleware(() => true, true);

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
                };
                const imageList = fileList["image_list"].map((image: any) => ({
                    imageData: image.buffer,
                    originalFileName: image.originalname
                }));

                const title = req.body.title as string;
                const description = req.body.description as string;
                const trailer = req.body.trailer as string;
                const duration = +req.body.duration;
                const releaseDate = +req.body.release_date;
                const genreIdList = getCommaSeparatedIdList(req.body.genre_id_list as string);
                const movieType = +req.body.type_id;
                const movie = await movieManagementOperator.createMovie(
                    title,
                    description,
                    duration,
                    releaseDate,
                    genreIdList,
                    movieType,
                    trailer,
                    imageList,
                    poster
                );
                res.json({ movie });
            }, next);
        })
    );

    router.get(
        "/api/movies/detail/:movieId",
        moviesManageAuthMiddleware,
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const movieId = +req.params.movieId;
                const { movie, genreList, imageList } = await movieManagementOperator.getMovie(movieId);
                res.json({
                    movie: movie,
                    genre_list: genreList,
                    image_list: imageList
                });
            }, next);
        })
    );

    router.get(
        "/api/movies/search",
        userLoggedInAuthMiddleware,
        asyncHandler(async (req, res) => {
            const query = `${req.query.query || ""}`;
            const limit = +(req.query.limit || DEFAULT_GET_MOVIE_LIST_LIMIT);
            const movie_list = await movieManagementOperator.searchMovieList(query, limit);
            res.json({
                movie_list: movie_list,
            });
        })
    );

    router.get(
        "/api/movies/current-showing",
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const offset = +(req.query.offset || 0);
                const limit = +(req.query.limit || DEFAULT_GET_CURRENT_SHOWING_MOVIE_LIST_LIMIT);
                const currentShowingMovieList = await movieManagementOperator.getCurrentShowingMovieList(offset, limit);
                res.json({ current_showing_movie_list: currentShowingMovieList });
            }, next);
        })
    );

    router.get(
        "/api/movies/upcoming",
        asyncHandler(async (req, res, next) => {
            errorHandlerMiddlewareFactory.catchToErrorHandlerMiddleware(async () => {
                const offset = +(req.query.offset || 0);
                const limit = +(req.query.limit || DEFAULT_GET_UPCOMING_MOVIE_LIST_LIMIT);
                const upcomingMovieList = await movieManagementOperator.getUpcomingMovieList(offset, limit);
                res.json({
                    upcoming_movie_list: upcomingMovieList
                });
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
