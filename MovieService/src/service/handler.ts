import { sendUnaryData, status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { MOVIE_MANAGEMENT_OPERATOR_TOKEN, MovieManagementOperator } from "../module/movie";
import { MOVIE_GENRE_MANAGEMENT_OPERATOR, MovieGenreManagementOperator } from "../module/movie_genre";
import { MovieServiceHandlers } from "../proto/gen/MovieService";
import { ErrorWithStatus } from "../utils";
import { SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, ScreenTypeManagementOperator } from "../module/screen_type";
import { SCREEN_MANAGEMENT_OPERATOR_TOKEN, ScreenManagementOperator } from "../module/screen";
import { THEATER_MANAGEMENT_OPERATOR_TOKEN, TheaterManagementOperator } from "../module/theater";
import { SEAT_MANAGEMENT_OPERATOR_TOKEN, SeatManagementOperator } from "../module/seat";
import { SHOWTIME_MANAGEMENT_OPERATOR_TOKEN, ShowtimeManagementOperator } from "../module/showtime";

export class MovieServiceHandlerFactory {
    constructor(
        private readonly movieGenreManagementOperator: MovieGenreManagementOperator,
        private readonly movieManagementOperator: MovieManagementOperator,
        private readonly screenTypeManagementOperator: ScreenTypeManagementOperator,
        private readonly screenManagementOperator: ScreenManagementOperator,
        private readonly theaterManagementOperator: TheaterManagementOperator,
        private readonly seatManagementOperator: SeatManagementOperator,
        private readonly showtimeManagementOperator: ShowtimeManagementOperator,
    ) { }

    public getMovieServiceHandlers(): MovieServiceHandlers {
        const handler: MovieServiceHandlers = {
            CreateMovie: async (call, callback) => {
                const req = call.request;
                if (req.title === undefined) {
                    return callback({ message: "title id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.releaseDate === undefined) {
                    return callback({ message: "release date is required", code: status.INVALID_ARGUMENT });
                }

                if (req.imageList === undefined) {
                    return callback({ message: "image list is required", code: status.INVALID_ARGUMENT });
                }

                if (req.poster === undefined) {
                    return callback({ message: "poster is required", code: status.INVALID_ARGUMENT });
                }

                const description = req.description || "";
                const duration = req.duration || 0;
                const genreIdList = req.genreIdList || [];
                const typeIdList = req.typeIdList || [];
                const trailer = req.trailer || "";
                const imageList = req.imageList || [];

                try {
                    const createdMovie = await this.movieManagementOperator.createMovie(
                        req.title,
                        description,
                        duration,
                        req.releaseDate,
                        genreIdList,
                        typeIdList,
                        trailer,
                        imageList as any,
                        req.poster as any
                    );
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


            CreateShowtime: async (call, callback) => {
                const req = call.request;
                if (req.movieId === undefined) {
                    return callback({ message: "movie id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.screenId === undefined) {
                    return callback({ message: "screen type id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.timeStart === undefined) {
                    return callback({ message: "time start is required", code: status.INVALID_ARGUMENT });
                }

                if (req.showtimeType === undefined) {
                    return callback({ message: "showtime type is required", code: status.INVALID_ARGUMENT });
                }


                try {
                    const createdShowtime = await this.showtimeManagementOperator.createShowtime(
                        req.movieId,
                        req.screenId,
                        req.timeStart,
                        req.showtimeType
                    );
                    callback(null, createdShowtime);
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            DeleteShowtime: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    await this.showtimeManagementOperator.deleteShowtime(req.id);
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

            GetMovie: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }
                try {
                    const { genreList, imageList, movie, movieTypeList } =
                        await this.movieManagementOperator.getMovie(
                            req.id
                        );
                    callback(null, { genreList, imageList, movie, movieTypeList });
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
    MOVIE_MANAGEMENT_OPERATOR_TOKEN,
    SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN,
    SCREEN_MANAGEMENT_OPERATOR_TOKEN,
    THEATER_MANAGEMENT_OPERATOR_TOKEN,
    SEAT_MANAGEMENT_OPERATOR_TOKEN,
    SHOWTIME_MANAGEMENT_OPERATOR_TOKEN
);

export const MOVIE_SERVICE_HANDLERS_FACTORY_TOKEN = token<MovieServiceHandlerFactory>("MovieServiceHandlersFactory");