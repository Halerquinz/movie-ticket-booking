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
    MOVIE_TYPE_DATA_ACCESSOR_TOKEN,
    MovieDataAccessor,
    MovieGenre,
    MovieGenreDataAccessor,
    MovieHasMovieGenreDataAccessor,
    MovieImage,
    MovieImageDataAccessor,
    MoviePosterDataAccessor,
    MovieTrailerDataAccessor,
    MovieType,
    MovieTypeDataAccessor
} from "../../dataaccess/db";
import { Movie } from "../../proto/gen/movie_service/Movie";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../../utils";
import { MOVIE_IMAGE_OPERATOR_TOKEN, MovieImageOperator } from "./movie_image_operator";
import { MOVIE_POSTER_OPERATOR_TOKEN, MoviePosterOperator } from "./movie_poster_operator";

export interface ImageInfo {
    originalFileName: string,
    imageData: Buffer,
}

export interface PosterInfo {
    originalFileName: string,
    imageData: Buffer,
}

export interface MovieManagementOperator {
    createMovie(
        title: string,
        description: string,
        duration: number,
        releaseDate: number,
        genreIdList: number[],
        movieTypeId: number,
        trailer: string,
        imageList: ImageInfo[],
        poster: PosterInfo
    ): Promise<Movie>;
    getMovie(id: number): Promise<{
        movie: Movie,
        genreList: MovieGenre[] | undefined,
        imageList: MovieImage[] | undefined;
    }>;
    getCurrentShowingMovieList(offset: number, limit: number): Promise<Movie[]>;
    getUpcomingMovieList(offset: number, limit: number): Promise<Movie[]>;
    searchMovie(query: string, limit: number): Promise<Movie[]>;
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
        private readonly movieTypeDM: MovieTypeDataAccessor,
        private readonly moviePosterDM: MoviePosterDataAccessor,
        private readonly timer: Timer,
        private readonly movieImageOperator: MovieImageOperator,
        private readonly moviePosterOperator: MoviePosterOperator,
    ) { }

    public async createMovie(
        title: string,
        description: string,
        duration: number,
        releaseDate: number,
        genreIdList: number[],
        movieTypeId: number,
        trailer: string,
        imageList: ImageInfo[],
        poster: PosterInfo
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
                of_movie_type_id: movieTypeId,
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

        await Promise.all(
            imageList.map((image) => this.movieImageOperator.createImage(
                createdMovie.movieId,
                image.originalFileName,
                image.imageData
            ))
        );

        await this.moviePosterOperator.createPoster(
            createdMovie.movieId,
            poster.originalFileName,
            poster.imageData
        );

        await this.movieTrailerDM.withTransaction(async (movieTrailerDM) => {
            const movieTrailerRecord = await movieTrailerDM.getMovieTrailerByMovieIdWithXLock(createdMovie.movieId);
            if (movieTrailerRecord !== null) {
                this.logger.error("trailer of movie has already exist", createdMovie.movieId);
                throw new ErrorWithStatus(`trailer of movie id ${createdMovie.movieId} has already exist`, status.ALREADY_EXISTS);
            }

            await movieTrailerDM.createMovieTrailer(createdMovie.movieId, trailer);
        });

        return {
            id: createdMovie.movieId,
        };
    }

    public async getMovie(id: number): Promise<{
        movie: Movie,
        genreList: MovieGenre[] | undefined,
        imageList: MovieImage[] | undefined;
    }> {
        const movie = await this.movieDM.getMovieById(id);
        if (movie === null) {
            this.logger.error("no movie with movie id found", { movieId: id });
            throw new ErrorWithStatus(`no movie with movie id ${id} found`, status.NOT_FOUND);
        }

        const genreList = await this.movieHasMovieGenreDM.getMovieGenreListByMovieId(id);
        const imageList = await this.movieImageDM.getMovieImageListByMovieId(id);

        return { movie, genreList, imageList };
    }

    private async isGenreIdListValid(genreIdList: number[]): Promise<boolean> {
        const movieGenreList = await this.movieGenreDM.getMovieGenreList();

        const moviePermissionIdSet = new Set<number>();
        for (const movieGenre of movieGenreList) {
            moviePermissionIdSet.add(movieGenre.id);
        }

        for (const genreId of genreIdList) {
            if (!moviePermissionIdSet.has(genreId)) {
                return false;
            }
        }

        return true;
    }

    public async searchMovie(query: string, limit: number): Promise<Movie[]> {
        if (query == "") {
            return [];
        }
        return await this.movieDM.searchMovie(query, limit);
    }

    public async deleteMovie(id: number): Promise<void> {
        return this.movieDM.deleteMovie(id);
    }

    public async getCurrentShowingMovieList(offset: number, limit: number): Promise<Movie[]> {
        const requestTime = this.timer.getCurrentTime();
        return await this.movieDM.getCurrentShowingMovieList(requestTime, offset, limit);
    }

    public async getUpcomingMovieList(offset: number, limit: number): Promise<Movie[]> {
        const requestTime = this.timer.getCurrentTime();
        return await this.movieDM.getUpcomingMovieList(requestTime, offset, limit);
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
    MOVIE_TYPE_DATA_ACCESSOR_TOKEN,
    MOVIE_POSTER_DATA_ACCESSOR_TOKEN,
    TIMER_TOKEN,
    MOVIE_IMAGE_OPERATOR_TOKEN,
    MOVIE_POSTER_OPERATOR_TOKEN
);

export const MOVIE_MANAGEMENT_OPERATOR_TOKEN = token<MovieManagementOperator>("MovieManagementOperator");
