import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Movie, MovieGenre, MovieImage, MoviePoster } from "../schemas";

export interface MovieManagementOperator {
    createMovie(
        title: string,
        description: string,
        duration: number | undefined,
        releaseDate: number,
        genreIdList: number[]
    ): Promise<Movie>;
    getMovie(id: number): Promise<{
        movie: Movie,
        movieGenreList: MovieGenre[] | [],
        moviePoster: MoviePoster | null,
        movieImageList: MovieImage[] | []
    }>;
    getCurrentShowingMovieList(): Promise<Movie[]>;
    getUpcomingMovieList(): Promise<Movie[]>;
    deleteMovie(id: number): Promise<void>;
}

export class MovieManagementOperatorImpl implements MovieManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createMovie(
        title: string,
        description: string,
        duration: number | undefined,
        releaseDate: number,
        genreIdList: number[]
    ): Promise<Movie> {
        const { error: createMovieError, response: createMovieResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createMovie.bind(this.movieServiceDM), {
            title,
            description,
            duration,
            releaseDate,
            genreIdList
        });

        if (createMovieError !== null) {
            this.logger.error("failed to call movie.createMovie()", { error: createMovieError });
            throw new ErrorWithHTTPCode(
                "failed to create movie",
                getHttpCodeFromGRPCStatus(createMovieError.code)
            );
        }

        return Movie.fromProto(createMovieResponse?.movie);
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
        movie: Movie;
        movieGenreList: MovieGenre[] | [];
        moviePoster: MoviePoster | null;
        movieImageList: [] | MovieImage[];
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


        return {
            movie: Movie.fromProto(getMovieResponse?.movie),
            movieGenreList: getMovieResponse?.movieGenreList?.map((movieGenreProto) => MovieGenre.fromProto(movieGenreProto)) || [],
            movieImageList: getMovieResponse?.movieImageList?.map((movieImageProto) => MovieImage.fromProto(movieImageProto)) || [],
            moviePoster: MoviePoster.fromProto(getMovieResponse?.moviePoster)
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
    LOGGER_TOKEN
);

export const MOVIE_MANAGEMENT_OPERATOR_TOKEN = token<MovieManagementOperator>("MovieManagementOperator");