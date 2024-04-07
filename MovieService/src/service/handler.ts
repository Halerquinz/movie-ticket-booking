import { sendUnaryData, status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { MOVIE_MANAGEMENT_OPERATOR_TOKEN, MovieManagementOperator } from "../module/movie";
import { MOVIE_GENRE_MANAGEMENT_OPERATOR, MovieGenreManagementOperator } from "../module/movie_genre";
import { MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN, MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN, MovieImageManagementOperator, MoviePosterManagementOperator } from "../module/movie_image";
import { MovieServiceHandlers } from "../proto/gen/MovieService";
import { ErrorWithStatus } from "../utils";
import { SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, ScreenTypeManagementOperator } from "../module/screen_type";
import { SCREEN_MANAGEMENT_OPERATOR_TOKEN, ScreenManagementOperator } from "../module/screen";
import { THEATER_MANAGEMENT_OPERATOR_TOKEN, TheaterManagementOperator } from "../module/theater";
import { SEAT_MANAGEMENT_OPERATOR_TOKEN, SeatManagementOperator } from "../module/seat";

export class MovieServiceHandlerFactory {
    constructor(
        private readonly movieGenreManagementOperator: MovieGenreManagementOperator,
        private readonly movieImageManagementOperator: MovieImageManagementOperator,
        private readonly moviePosterManagementOperator: MoviePosterManagementOperator,
        private readonly movieManagementOperator: MovieManagementOperator,
        private readonly screenTypeManagementOperator: ScreenTypeManagementOperator,
        private readonly screenManagementOperator: ScreenManagementOperator,
        private readonly theaterManagementOperator: TheaterManagementOperator,
        private readonly seatManagementOperator: SeatManagementOperator,
    ) { }

    public getMovieServiceHandlers(): MovieServiceHandlers {
        const handler: MovieServiceHandlers = {
            CreateImage: async (call, callback) => {
                const req = call.request;
                if (req.ofMovieId === undefined) {
                    return callback({ message: "movie id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.imageData === undefined) {
                    return callback({ message: "image data is required", code: status.INVALID_ARGUMENT });
                }

                const originalFileName = req.originalFileName || "";

                try {
                    const createdImage = await this.movieImageManagementOperator.createImage(
                        req.ofMovieId,
                        originalFileName,
                        req.imageData
                    );
                    callback(null, { movieImage: createdImage });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            CreateMovie: async (call, callback) => {
                const req = call.request;
                if (req.title === undefined) {
                    return callback({ message: "title id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.releaseDate === undefined) {
                    return callback({ message: "release date is required", code: status.INVALID_ARGUMENT });
                }
                const description = req.description || "";
                const duration = req.duration || 0;
                const genreIdList = req.genreIdList || [];
                const releaseDate = +req.releaseDate.toString();

                try {
                    const createdMovie = await this.movieManagementOperator.createMovie(
                        req.title,
                        description,
                        duration,
                        releaseDate,
                        genreIdList as any
                    )
                    callback(null, { movie: createdMovie });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            CreateMovieGenre: async (call, callback) => {
                const req = call.request;
                if (req.displayName === undefined) {
                    return callback({ message: "display name id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const createdMovieGenre = await this.movieGenreManagementOperator.createMovieGenre(
                        req.displayName
                    )
                    callback(null, { movieGenre: createdMovieGenre });
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            CreatePoster: async (call, callback) => {
                const req = call.request;
                if (req.ofMovieId === undefined) {
                    return callback({ message: "movie id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.imageData === undefined) {
                    return callback({ message: "image data is required", code: status.INVALID_ARGUMENT });
                }

                const originalFileName = req.originalFileName || "";

                try {
                    const createdPoster = await this.moviePosterManagementOperator.createPoster(
                        req.ofMovieId,
                        originalFileName,
                        req.imageData
                    );
                    callback(null, { moviePoster: createdPoster });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            CreateScreenType: async (call, callback) => {
                const req = call.request;
                if (req.displayName === undefined) {
                    return callback({ message: "displayname is required", code: status.INVALID_ARGUMENT });
                }

                if (req.rowCount === undefined) {
                    return callback({ message: "row count data is required", code: status.INVALID_ARGUMENT });
                }

                if (req.seatOfRowCount === undefined) {
                    return callback({ message: "seat of row count data is required", code: status.INVALID_ARGUMENT });
                }

                if (req.seatCount === undefined) {
                    return callback({ message: "seat count is required", code: status.INVALID_ARGUMENT });
                }

                const description = req.description || "";


                try {
                    const createdScreenType = await this.screenTypeManagementOperator.createScreenType(
                        req.displayName,
                        description,
                        req.seatCount,
                        req.rowCount,
                        req.seatOfRowCount
                    );
                    callback(null, createdScreenType);
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            CreateTheater: async (call, callback) => {
                const req = call.request;
                if (req.displayName === undefined) {
                    return callback({ message: "displayname is required", code: status.INVALID_ARGUMENT });
                }

                if (req.location === undefined) {
                    return callback({ message: "location data is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const createdTheater = await this.theaterManagementOperator.createTheater(
                        req.displayName,
                        req.location
                    );
                    callback(null, createdTheater);
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            CreateScreen: async (call, callback) => {
                const req = call.request;
                if (req.displayName === undefined) {
                    return callback({ message: "displayname is required", code: status.INVALID_ARGUMENT });
                }

                if (req.screenTypeId === undefined) {
                    return callback({ message: "screen type id data is required", code: status.INVALID_ARGUMENT });
                }

                if (req.theaterId === undefined) {
                    return callback({ message: "theater id data is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const createdScreen = await this.screenManagementOperator.createScreen(
                        req.theaterId,
                        req.screenTypeId,
                        req.displayName,
                    )
                    callback(null, createdScreen);
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            CreateAllSeatOfScreen: async (call, callback) => {
                const req = call.request;
                if (req.screenId === undefined) {
                    return callback({ message: "screen id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.screenTypeId === undefined) {
                    return callback({ message: "screen type id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const createdAllSeatOfScreen = await this.seatManagementOperator.createAllSeatOfScreen(
                        req.screenId,
                        req.screenTypeId
                    );
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            DeleteImage: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.movieImageManagementOperator.deleteImage(req.id);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            DeleteMovie: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.movieManagementOperator.deleteMovie(req.id);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            DeleteMovieGenre: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.movieGenreManagementOperator.deleteMovieGenre(req.id);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            DeletePoster: async (call, callback) => {
                const req = call.request;
                if (req.ofMovieId === undefined) {
                    return callback({ message: "movie id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.moviePosterManagementOperator.deletePoster(req.ofMovieId);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            DeleteScreen: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "screen id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.screenManagementOperator.deleteScreen(req.id);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            DeleteScreenType: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "screen type id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.screenManagementOperator.deleteScreen(req.id);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            DeleteTheater: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "theater id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.theaterManagementOperator.deleteTheater(req.id);
                    callback(null, {});
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            GetCurrentShowingMovieList: async (call, callback) => {
                try {
                    const currentShowingMovieList = await this.movieManagementOperator.getCurrentShowingMovieList();
                    callback(null, { movieList: currentShowingMovieList });
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            GetImage: async (call, callback) => {
                const req = call.request;
                if (req.movieId === undefined) {
                    return callback({ message: "movie id is required", code: status.INVALID_ARGUMENT });
                }
                try {
                    const movieImage = await this.movieImageManagementOperator.getImage(
                        req.movieId
                    );
                    callback(null, { movieImageList: movieImage });
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            GetMovie: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }
                try {
                    const movie = await this.movieManagementOperator.getMovie(
                        req.id
                    );
                    callback(null, {
                        movie: movie.movie,
                        movieGenreList: movie.movieGenreList,
                        movieImageList: movie.movieImageList,
                        moviePoster: movie.moviePoster
                    });
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            GetPoster: async (call, callback) => {
                const req = call.request;
                if (req.movieId === undefined) {
                    return callback({ message: "movie id is required", code: status.INVALID_ARGUMENT });
                }
                try {
                    const moviePoster = await this.moviePosterManagementOperator.getPoster(
                        req.movieId
                    );
                    callback(null, { moviePoster: moviePoster });
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            GetUpcomingMovieList: async (call, callback) => {
                const req = call.request;
                try {
                    const movieList = await this.movieManagementOperator.getUpcomingMovieList();
                    callback(null, { movieList: movieList });
                } catch (error) {
                    this.handleError(error, callback)
                }
            },

            UpdateMovieGenre: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.displayName === undefined) {
                    return callback({ message: "displayname is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const movieGenre = await this.movieGenreManagementOperator.updateMovieGenre(
                        req.id,
                        req.displayName
                    );
                    callback(null, { movieGenre: movieGenre });
                } catch (error) {
                    this.handleError(error, callback)
                }
            },
        }
        return handler
    }

    private handleError(error: unknown, callback: sendUnaryData<any>) {
        if (error instanceof ErrorWithStatus) {
            callback({ message: error.message, code: error.status });
        } else if (error instanceof Error) {
            callback({ message: error.message, code: status.INTERNAL });
        } else {
            callback({ code: status.INTERNAL });
        }
    }
}

injected(MovieServiceHandlerFactory,
    MOVIE_GENRE_MANAGEMENT_OPERATOR,
    MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN,
    MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN,
    MOVIE_MANAGEMENT_OPERATOR_TOKEN,
    SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN,
    SCREEN_MANAGEMENT_OPERATOR_TOKEN,
    THEATER_MANAGEMENT_OPERATOR_TOKEN,
    SEAT_MANAGEMENT_OPERATOR_TOKEN
);

export const MOVIE_SERVICE_HANDLERS_FACTORY_TOKEN = token<MovieServiceHandlerFactory>("MovieServiceHandlersFactory");