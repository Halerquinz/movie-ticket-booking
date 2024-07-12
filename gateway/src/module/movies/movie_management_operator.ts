import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { ImageInfo } from "../../proto/gen/movie_service/ImageInfo";
import { MovieServiceClient } from "../../proto/gen/movie_service/MovieService";
import { PosterInfo } from "../../proto/gen/movie_service/PosterInfo";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Movie, MovieGenre, MovieImage } from "../schemas";
import { IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN, ImageProtoToImageConverter, POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN, PosterProtoToPosterConverter } from "../schemas/converters";
import { Movie as MovieProto } from "../../proto/gen/movie_service/Movie";

export interface MovieManagementOperator {
    createMovie(
        title: string,
        description: string,
        duration: number,
        releaseDate: number,
        genreIdList: number[],
        movieType: number,
        trailer: string,
        imageList: ImageInfo[],
        poster: PosterInfo
    ): Promise<number>;
    getMovie(id: number): Promise<{
        movie: Movie,
        genreList: MovieGenre[] | undefined,
        imageList: MovieImage[] | undefined;
    }>;
    getCurrentShowingMovieList(offset: number, limit: number): Promise<Movie[]>;
    getUpcomingMovieList(offset: number, limit: number): Promise<Movie[]>;
    deleteMovie(id: number): Promise<void>;
    searchMovieList(query: string, limit: number): Promise<Movie[]>;
}

export class MovieManagementOperatorImpl implements MovieManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
        private readonly imageProtoToImageConverter: ImageProtoToImageConverter,
        private readonly posterProtoToPosterConverter: PosterProtoToPosterConverter,
    ) { }

    public async createMovie(
        title: string,
        description: string,
        duration: number,
        releaseDate: number,
        genreIdList: number[],
        typeId: number,
        trailer: string,
        imageList: ImageInfo[],
        poster: PosterInfo
    ): Promise<number> {
        const { error: createMovieError, response: createMovieResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createMovie.bind(this.movieServiceDM), {
            title,
            description,
            duration,
            releaseDate,
            genreIdList,
            imageList,
            poster,
            trailer,
            typeId: typeId
        });

        if (createMovieError !== null) {
            this.logger.error("failed to call movie.createMovie()", { error: createMovieError });
            throw new ErrorWithHTTPCode(
                "failed to create movie",
                getHttpCodeFromGRPCStatus(createMovieError.code)
            );
        }

        return createMovieResponse?.movie?.id || 0;
    }

    public async deleteMovie(id: number): Promise<void> {
        const { error: deleteMovieError } = await promisifyGRPCCall(
            this.movieServiceDM.deleteMovie.bind(this.movieServiceDM), { id }
        );

        if (deleteMovieError !== null) {
            this.logger.error("failed to call movie.deleteMovie()", { error: deleteMovieError });
            throw new ErrorWithHTTPCode(
                "failed to delete movie",
                getHttpCodeFromGRPCStatus(deleteMovieError.code)
            );
        }
    }

    public async getCurrentShowingMovieList(offset: number, limit: number): Promise<Movie[]> {
        const { error: getCurrentShowingMovieListError, response: getCurrentShowingMovieListResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getCurrentShowingMovieList.bind(this.movieServiceDM), { offset, limit }
        );

        if (getCurrentShowingMovieListError !== null) {
            this.logger.error("failed to call movie.getCurrentShowingMovieList()", { error: getCurrentShowingMovieListError });
            throw new ErrorWithHTTPCode(
                "failed to get current showing movie list",
                getHttpCodeFromGRPCStatus(getCurrentShowingMovieListError.code)
            );
        }

        if (getCurrentShowingMovieListResponse?.movieList === undefined) return [];

        let movieListProto = getCurrentShowingMovieListResponse.movieList as any;
        movieListProto = await Promise.all(
            movieListProto.map(async (movieProto: any) => {
                movieProto.poster = await this.posterProtoToPosterConverter.convert(movieProto?.poster);
                return movieProto;
            }));

        return (
            movieListProto.map((movieProto: MovieProto) => {
                return Movie.fromProto(movieProto);
            }
            ) || []
        );
    }

    public async getMovie(id: number): Promise<{
        movie: Movie,
        genreList: MovieGenre[] | undefined,
        imageList: MovieImage[] | undefined;
    }> {
        const { error: getMovieError, response: getMovieResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getMovie.bind(this.movieServiceDM), { id }
        );

        if (getMovieError !== null) {
            this.logger.error("failed to call movie.getMovie()", { error: getMovieError });
            throw new ErrorWithHTTPCode(
                "failed to get movie detail",
                getHttpCodeFromGRPCStatus(getMovieError.code)
            );
        }

        const imageList = await Promise.all(
            getMovieResponse?.imageList?.map((movieImageProto) => this.imageProtoToImageConverter.convert(movieImageProto)) || [],
        );

        const movieProto = getMovieResponse?.movie as any;
        movieProto.poster = await this.posterProtoToPosterConverter.convert(movieProto?.poster);

        return {
            movie: Movie.fromProto(movieProto),
            genreList: getMovieResponse?.genreList?.map((movieGenreProto) => MovieGenre.fromProto(movieGenreProto)) || [],
            imageList,
        };
    }

    public async getUpcomingMovieList(offset: number, limit: number): Promise<Movie[]> {
        const { error: getUpcomingMovieListError, response: getUpcomingMovieListResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getUpcomingMovieList.bind(this.movieServiceDM), { offset, limit }
        );

        if (getUpcomingMovieListError !== null) {
            this.logger.error("failed to call movie.getUpcomingShowingMovieList()", { error: getUpcomingMovieListError });
            throw new ErrorWithHTTPCode(
                "failed to get upcoming movie list",
                getHttpCodeFromGRPCStatus(getUpcomingMovieListError.code)
            );
        }

        if (getUpcomingMovieListResponse?.movieList === undefined) return [];

        let movieListProto = getUpcomingMovieListResponse?.movieList as any;
        movieListProto = await Promise.all(movieListProto.map(async (movieProto: any) => {
            movieProto.poster = await this.posterProtoToPosterConverter.convert(movieProto?.poster);
            return movieProto;
        }));

        return (
            movieListProto.map((movieProto: MovieProto) => {
                return Movie.fromProto(movieProto);
            }
            ) || []
        );
    }

    public async searchMovieList(query: string, limit: number): Promise<Movie[]> {
        const { error: searchMovieError, response: searchMovieResponse } = await promisifyGRPCCall(
            this.movieServiceDM.searchMovie.bind(this.movieServiceDM),
            { query, limit }
        );
        if (searchMovieError !== null) {
            this.logger.error("failed to call movie_service.searchMovie()", {
                error: searchMovieError,
            });
            throw new ErrorWithHTTPCode("Failed to search movie list", getHttpCodeFromGRPCStatus(searchMovieError.code));
        }

        const movieProtoList = searchMovieResponse?.movieList || [];
        return movieProtoList.map((movieProto) => Movie.fromProto(movieProto));
    }
}

injected(
    MovieManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN,
    IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN,
    POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN
);

export const MOVIE_MANAGEMENT_OPERATOR_TOKEN = token<MovieManagementOperator>("MovieManagementOperator");