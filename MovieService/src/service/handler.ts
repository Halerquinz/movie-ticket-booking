import { sendUnaryData, status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { MOVIE_MANAGEMENT_OPERATOR_TOKEN, MovieManagementOperator } from "../module/movie";
import { MOVIE_GENRE_MANAGEMENT_OPERATOR, MovieGenreManagementOperator } from "../module/movie_genre";
import { PRICE_MANAGEMENT_OPERATOR_TOKEN, PriceManagementOperator } from "../module/price";
import { SCREEN_MANAGEMENT_OPERATOR_TOKEN, ScreenManagementOperator } from "../module/screen";
import { SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, ScreenTypeManagementOperator } from "../module/screen_type";
import { SEAT_MANAGEMENT_OPERATOR_TOKEN, SeatManagementOperator } from "../module/seat";
import {
    SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN,
    SHOWTIME_MANAGEMENT_OPERATOR_TOKEN,
    ShowtimeListManagementOperator,
    ShowtimeManagementOperator
} from "../module/showtime";
import { THEATER_MANAGEMENT_OPERATOR_TOKEN, TheaterManagementOperator } from "../module/theater";
import { MovieServiceHandlers } from "../proto/gen/movie_service/MovieService";
import { ErrorWithStatus } from "../utils";

const DEFAULT_MOVIE_SEARCH_LIMIT = 10;
const DEFAULT_GET_UPCOMING_MOVIE_LIST_LIMIT = 5;
const DEFAULT_GET_CURRENT_SHOWING_MOVIE_LIST_LIMIT = 5;

export class MovieServiceHandlerFactory {
    constructor(
        private readonly movieGenreManagementOperator: MovieGenreManagementOperator,
        private readonly movieManagementOperator: MovieManagementOperator,
        private readonly screenTypeManagementOperator: ScreenTypeManagementOperator,
        private readonly screenManagementOperator: ScreenManagementOperator,
        private readonly theaterManagementOperator: TheaterManagementOperator,
        private readonly seatManagementOperator: SeatManagementOperator,
        private readonly showtimeManagementOperator: ShowtimeManagementOperator,
        private readonly showtimeListManagementOperator: ShowtimeListManagementOperator,
        private readonly priceManagementOperator: PriceManagementOperator,
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

                if (req.typeId === undefined) {
                    return callback({ message: "typeid is required", code: status.INVALID_ARGUMENT });
                }

                const description = req.description || "";
                const duration = req.duration || 0;
                const genreIdList = req.genreIdList || [];
                const trailer = req.trailer || "";
                const imageList = req.imageList || [];

                try {
                    const createdMovie = await this.movieManagementOperator.createMovie(
                        req.title,
                        description,
                        duration,
                        req.releaseDate,
                        genreIdList,
                        req.typeId,
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
                    );
                    callback(null, { movieGenre: createdMovieGenre });
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
                    );
                    callback(null, { screen: createdScreen as any });
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

                try {
                    const showtime = await this.showtimeManagementOperator.createShowtime(
                        req.movieId,
                        req.screenId,
                        req.timeStart,
                    );
                    callback(null, { showtime });
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
                    this.handleError(error, callback);
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
                    this.handleError(error, callback);
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
                    this.handleError(error, callback);
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
                    this.handleError(error, callback);
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
                    this.handleError(error, callback);
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
                    this.handleError(error, callback);
                }
            },

            GetCurrentShowingMovieList: async (call, callback) => {
                const req = call.request;
                if (req.limit === undefined) {
                    req.limit = DEFAULT_GET_CURRENT_SHOWING_MOVIE_LIST_LIMIT;
                }
                if (req.offset === undefined) {
                    req.offset = 0;
                }

                try {
                    const currentShowingMovieList = await this.movieManagementOperator.getCurrentShowingMovieList(req.offset, req.limit);
                    callback(null, { movieList: currentShowingMovieList });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetMovie: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({ message: "id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const { genreList, imageList, movie } =
                        await this.movieManagementOperator.getMovie(
                            req.id
                        );
                    callback(null, { genreList, imageList, movie });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },


            GetUpcomingMovieList: async (call, callback) => {
                const req = call.request;
                if (req.limit === undefined) {
                    req.limit = DEFAULT_GET_UPCOMING_MOVIE_LIST_LIMIT;
                }
                if (req.offset === undefined) {
                    req.offset = 0;
                }

                try {
                    const movieList = await this.movieManagementOperator.getUpcomingMovieList(req.offset, req.limit);
                    callback(null, { movieList: movieList });
                } catch (error) {
                    this.handleError(error, callback);
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
                    this.handleError(error, callback);
                }
            },

            GetShowtimeListOfTheaterByMovieId: async (call, callback) => {
                const req = call.request;
                if (req.theaterId === undefined) {
                    return callback({ message: "theater id is required", code: status.INVALID_ARGUMENT });
                }

                if (req.movieId === undefined) {
                    return callback({ message: "movie id is required", code: status.INVALID_ARGUMENT });
                }

                const requestTime = req.requestTime || 0;

                try {
                    const { theater, showtimeListOfTheater } = await this.showtimeListManagementOperator.getShowtimeListOfTheaterByMovieId(
                        req.theaterId,
                        req.movieId,
                        requestTime
                    );

                    callback(null, { theater: theater, showtimeListOfTheater: showtimeListOfTheater });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetShowtimeListOfTheater: async (call, callback) => {
                const req = call.request;
                if (req.theaterId === undefined) {
                    return callback({ message: "theater id is required", code: status.INVALID_ARGUMENT });
                }

                const requestTime = req.requestTime || 0;

                try {
                    const { theater, showtimeListOfTheater } = await this.showtimeListManagementOperator.getShowtimeListOfTheater(
                        req.theaterId,
                        requestTime
                    );
                    callback(null, { theater: theater, showtimeListOfTheater: showtimeListOfTheater });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetPrice: async (call, callback) => {
                const req = call.request;
                if (req.showtimeId === undefined) {
                    return callback({ message: "showtime id  is required", code: status.INVALID_ARGUMENT });
                }

                if (req.seatId === undefined) {
                    return callback({ message: "seat id is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const price = await this.priceManagementOperator.getPrice(
                        req.showtimeId,
                        req.seatId,
                    );
                    callback(null, { price });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetSeat: async (call, callback) => {
                const req = call.request;
                if (req.seatId === undefined) {
                    return callback({ message: "seatId id  is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const seat = await this.seatManagementOperator.getSeat(req.seatId);
                    callback(null, { seat: seat as any });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetShowtime: async (call, callback) => {
                const req = call.request;
                if (req.showtimeId === undefined) {
                    return callback({ message: "showtime id  is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const showtime = await this.showtimeManagementOperator.getShowtime(req.showtimeId);
                    callback(null, { showtime: showtime });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetScreen: async (call, callback) => {
                const req = call.request;
                if (req.screenId === undefined) {
                    return callback({ message: "screen id  is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const screen = await this.screenManagementOperator.getScreen(req.screenId);
                    callback(null, { screen });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetTheater: async (call, callback) => {
                const req = call.request;
                if (req.theaterId === undefined) {
                    return callback({ message: "theater id  is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const theater = await this.theaterManagementOperator.getTheater(req.theaterId);
                    callback(null, { theater });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetTheaterList: async (call, callback) => {
                const req = call.request;
                try {
                    const theaterList = await this.theaterManagementOperator.getTheaterList();
                    callback(null, { theaterList });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            GetShowtimeMetadata: async (call, callback) => {
                const req = call.request;
                if (req.showtimeId === undefined) {
                    return callback({ message: "showtime id  is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const showtimeMetadata = await this.showtimeManagementOperator.getShowtimeMetadata(req.showtimeId);
                    callback(null, { showtimeMetadata });
                } catch (error) {
                    this.handleError(error, callback);
                }
            },

            SearchMovie: async (call, callback) => {
                const req = call.request;
                if (req.limit === undefined) {
                    req.limit = DEFAULT_MOVIE_SEARCH_LIMIT;
                }

                if (req.query === undefined) {
                    return callback({ message: "query is required", code: status.INVALID_ARGUMENT });
                }

                try {
                    const movieList = await this.movieManagementOperator.searchMovie(req.query, req.limit);
                    callback(null, { movieList });
                } catch (error) {
                    this.handleError(error, callback);
                }
            }
        };
        return handler;
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
    SHOWTIME_MANAGEMENT_OPERATOR_TOKEN,
    SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN,
    PRICE_MANAGEMENT_OPERATOR_TOKEN
);

export const MOVIE_SERVICE_HANDLERS_FACTORY_TOKEN = token<MovieServiceHandlerFactory>("MovieServiceHandlersFactory");