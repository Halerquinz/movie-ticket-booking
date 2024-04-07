import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import { filterXSS } from "xss";
import {
    MOVIE_DATA_ACCESSOR_TOKEN,
    MOVIE_GENRE_DATA_ACCESSOR_TOKEN,
    MOVIE_HAS_MOVIE_GENRE_DATA_ACCESSOR_TOKEN,
    MOVIE_IMAGE_DATA_ACCESSOR_TOKEN,
    MOVIE_POSTER_DATA_ACCESSOR_TOKEN,
    MOVIE_TRAILER_DATA_ACCESSOR_TOKEN,
    MovieDataAccessor,
    MovieGenre,
    MovieGenreDataAccessor,
    MovieHasMovieGenreDataAccessor,
    MovieImage,
    MovieImageDataAccessor,
    MoviePoster,
    MoviePosterDataAccessor,
    MovieTrailer,
    MovieTrailerDataAccessor
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { Movie } from "../../proto/gen/Movie";

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
        private readonly logger: Logger,
        private readonly movieDM: MovieDataAccessor,
        private readonly movieTrailerDM: MovieTrailerDataAccessor,
        private readonly movieImageDM: MovieImageDataAccessor,
        private readonly movieGenreDM: MovieGenreDataAccessor,
        private readonly movieHasMovieGenreDM: MovieHasMovieGenreDataAccessor,
        private readonly moviePosterDM: MoviePosterDataAccessor,
        private readonly timer: Timer,
    ) { }

    public async createMovie(
        title: string,
        description: string,
        duration: number,
        releaseDate: number,
        genreIdList: number[]
    ): Promise<Movie> {
        description = this.sanitizeDescription(description);
        title = this.sanitizeTitle(title);

        if (!this.isValidReleaseDate(releaseDate)) {
            this.logger.error("invalid release date", { releaseDate });
            throw new ErrorWithStatus(`invalid release date ${releaseDate}`, status.INVALID_ARGUMENT);
        }

        if (genreIdList.length > 0) {
            if (!this.isGenreIdListValid(genreIdList)) {
                this.logger.error("one or more items of the genre Id list is incompatible", {
                    genreIdList
                });
                throw new ErrorWithStatus("one or more items of the genre Id list is incompatible",
                    status.FAILED_PRECONDITION);
            }
        }

        const createdMovie = await this.movieDM.withTransaction(async (movieDM) => {
            const movieRecord = await movieDM.getMovieByTitleWithXLock(title);
            if (movieRecord !== null) {
                this.logger.error("title has already been taken", {
                    title,
                });
                throw new ErrorWithStatus(`title ${title} has already been taken`, status.ALREADY_EXISTS);
            }

            const createdMovieId = await movieDM.createMovie({
                title: title,
                description: description,
                duration: duration,
                releaseDate: releaseDate
            });

            return {
                movieId: createdMovieId,
                title,
                description,
                duration,
                releaseDate,
            };
        });

        await this.movieHasMovieGenreDM.withTransaction(async (movieHasMovieGenreDM) => {
            for (const genreId of genreIdList) {
                await movieHasMovieGenreDM.createMovieHasMovieGenre(createdMovie.movieId, genreId);
            }
        });

        return createdMovie;
    }

    public async getMovie(id: number): Promise<{
        movie: Movie;
        movieTrailer: MovieTrailer | null,
        movieGenreList: MovieGenre[] | [];
        moviePoster: MoviePoster | null;
        movieImageList: MovieImage[] | [];
    }> {
        const movie = await this.movieDM.getMovieById(id);
        if (movie === null) {
            this.logger.error("no movie with movie id found", { movieId: id });
            throw new ErrorWithStatus(`no movie with movie id ${id} found`, status.NOT_FOUND);
        }

        const movieTrailer = await this.movieTrailerDM.getMovieTrailerByMovieId(id);
        const movieGenreList = await this.movieHasMovieGenreDM.getMovieGenreListByMovieId(id);
        const moviePoster = await this.moviePosterDM.getMoviePosterByMovieId(id);
        const movieImageList = await this.movieImageDM.getMovieImageListByMovieId(id);

        return { movie, movieTrailer, movieGenreList, moviePoster, movieImageList };
    }

    private async isGenreIdListValid(genreIdList: number[]): Promise<boolean> {
        const movieGenreList = await this.movieGenreDM.getMovieGenreList();

        const moviePermissionIdSet = new Set<number>();
        for (const movieGenre of movieGenreList) {
            moviePermissionIdSet.add(movieGenre.movieGenreId);
        }

        for (const genreId of genreIdList) {
            if (!moviePermissionIdSet.has(genreId)) {
                return false;
            }
        }

        return true;
    }

    public async deleteMovie(id: number): Promise<void> {
        return this.movieDM.deleteMovie(id);
    }

    public async getCurrentShowingMovieList(): Promise<Movie[]> {
        const requestTime = this.timer.getCurrentTime();
        return await this.movieDM.getCurrentShowingMovieList(requestTime);
    }

    public async getUpcomingMovieList(): Promise<Movie[]> {
        const requestTime = this.timer.getCurrentTime();
        return await this.movieDM.getUpcomingMovieList(requestTime);
    }

    private sanitizeTitle(title: string): string {
        return validator.escape(validator.trim(title));
    }

    private sanitizeDescription(description: string): string {
        return filterXSS(validator.trim(description));
    }

    private isValidReleaseDate(releaseDate: number): boolean {
        const dateStr = new Date(releaseDate).toISOString();
        return validator.isISO8601(dateStr);
    }
}

injected(
    MovieManagementOperatorImpl,
    LOGGER_TOKEN,
    MOVIE_DATA_ACCESSOR_TOKEN,
    MOVIE_TRAILER_DATA_ACCESSOR_TOKEN,
    MOVIE_IMAGE_DATA_ACCESSOR_TOKEN,
    MOVIE_GENRE_DATA_ACCESSOR_TOKEN,
    MOVIE_HAS_MOVIE_GENRE_DATA_ACCESSOR_TOKEN,
    MOVIE_POSTER_DATA_ACCESSOR_TOKEN,
    TIMER_TOKEN
);

export const MOVIE_MANAGEMENT_OPERATOR_TOKEN = token<MovieManagementOperator>("MovieManagementOperator");
