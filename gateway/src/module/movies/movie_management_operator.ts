import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { ImageInfo } from "../../proto/gen/ImageInfo";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { PosterInfo } from "../../proto/gen/PosterInfo";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Movie, MovieGenre, MovieImage, MovieType } from "../schemas";
import { IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN, ImageProtoToImageConverter, POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN, PosterProtoToPosterConverter } from "../schemas/converters";

export interface MovieManagementOperator {
    createMovie(
        title: string,
        description: string,
        duration: number,
        releaseDate: number,
        genreIdList: number[],
        movieTypeIdList: number[],
        trailer: string,
        imageList: ImageInfo[],
        poster: PosterInfo
    ): Promise<number>;
    getMovie(id: number): Promise<{
        movie: Movie,
        genreList: MovieGenre[] | undefined,
        movieTypeList: MovieType[] | undefined,
        imageList: MovieImage[] | undefined
    }>;
    getCurrentShowingMovieList(): Promise<Movie[]>;
    getUpcomingMovieList(): Promise<Movie[]>;
    deleteMovie(id: number): Promise<void>;
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
        movieTypeIdList: number[],
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
            typeIdList: movieTypeIdList
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

    public async getCurrentShowingMovieList(): Promise<Movie[]> {
        const { error: getCurrentShowingMovieListError, response: getCurrentShowingMovieListResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getCurrentShowingMovieList.bind(this.movieServiceDM), {}
        );

        if (getCurrentShowingMovieListError !== null) {
            this.logger.error("failed to call movie.getCurrentShowingMovieList()", { error: getCurrentShowingMovieListError });
            throw new ErrorWithHTTPCode(
                "failed to get current showing movie list",
                getHttpCodeFromGRPCStatus(getCurrentShowingMovieListError.code)
            );
        }

        return (
            getCurrentShowingMovieListResponse?.movieList?.map((movieProto) =>
                Movie.fromProto(movieProto)
            ) || []
        );
    }

    public async getMovie(id: number): Promise<{
        movie: Movie,
        genreList: MovieGenre[] | undefined,
        movieTypeList: MovieType[] | undefined,
        imageList: MovieImage[] | undefined
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
            movieTypeList: getMovieResponse?.movieTypeList?.map((movieTypeProto) => MovieType.fromProto(movieTypeProto)) || [],
        };
    }

    public async getUpcomingMovieList(): Promise<Movie[]> {
        const { error: getUpcomingMovieListError, response: getUpcomingMovieListResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getUpcomingMovieList.bind(this.movieServiceDM), {}
        );

        if (getUpcomingMovieListError !== null) {
            this.logger.error("failed to call movie.getUpcomingShowingMovieList()", { error: getUpcomingMovieListError });
            throw new ErrorWithHTTPCode(
                "failed to get upcoming movie list",
                getHttpCodeFromGRPCStatus(getUpcomingMovieListError.code)
            );
        }

        return (
            getUpcomingMovieListResponse?.movieList?.map((movieProto) =>
                Movie.fromProto(movieProto)
            ) || []
        );
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