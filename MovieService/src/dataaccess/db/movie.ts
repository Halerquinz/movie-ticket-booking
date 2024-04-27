import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Movie, MoviePoster, MovieTrailer, MovieType } from "./models";

export class MovieWithPoster {
    constructor(
        public movieId: number,
        public title: string,
        public description: string,
        public duration: number,
        public releaseDate: number,
        public originalFileName: string,
        public originalImageFileName: string,
        public originalThumbnailFileName: string,
    ) { }
}
export interface CreateMovieArguments {
    of_movie_type_id: number,
    title: string;
    description: string;
    duration: number;
    releaseDate: number;
}

export interface UpdateMovieArguments {
    of_movie_type_id: number,
    movieId: string;
    title: string;
    description: string;
    duration: number;
    releaseDate: number;
}

export interface MovieDataAccessor {
    createMovie(args: CreateMovieArguments): Promise<number>;
    updateMovie(args: UpdateMovieArguments): Promise<void>;
    deleteMovie(id: number): Promise<void>;
    getMovieById(id: number): Promise<Movie | null>;
    getMovieByIdWithXLock(id: number): Promise<Movie | null>;
    getCurrentShowingMovieList(requestTime: number): Promise<Movie[]>;
    getUpcomingMovieList(requestTime: number): Promise<Movie[]>;
    getMovieByTitleWithXLock(title: string): Promise<Movie | null>;
    withTransaction<T>(cb: (dataAccessor: MovieDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieTab = "movie_service_movie_tab";
const ColNameMovieServiceMovieId = "movie_id";
const ColNameMovieServiceOfMovieTypeId = "of_movie_type_id";
const ColNameMovieServiceMovieTitle = "title";
const ColNameMovieServiceMovieDescription = "description";
const ColNameMovieServiceMovieDuration = "duration";
const ColNameMovieServiceMovieReleaseDate = "release_date";

const TabNameMovieServiceMoviePosterTab = "movie_service_movie_poster_tab";
const ColNameMovieServiceMoviePosterOfMovieId = "of_movie_id";
const ColNameMovieServiceMoviePosterOriginalFileName = "original_filename";
const ColNameMovieServiceMoviePosterOriginalImageFileName = "original_image_filename";
const ColNameMovieServiceMoviePosterThumbnailImageFileName = "thumbnail_image_filename";

const TabNameMovieServiceMovieTrailerTab = "movie_service_movie_trailer_tab";
const ColNameMovieServiceMovieTrailerOfMovieId = "of_movie_id";
const ColNameMovieServiceMovieTrailerYoutubeLinkUrl = "youtube_link_url";

const TabNameMovieServiceMovieTypeTab = "movie_service_movie_type_tab";
const ColNameMovieServiceMovieTypeId = "movie_type_id";
const ColNameMovieServiceMovieTypeDisplayname = "display_name";

export class MovieDataAccessorImpl implements MovieDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createMovie(args: CreateMovieArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceOfMovieTypeId]: args.of_movie_type_id,
                    [ColNameMovieServiceMovieTitle]: args.title,
                    [ColNameMovieServiceMovieDescription]: args.description,
                    [ColNameMovieServiceMovieDuration]: args.duration,
                    [ColNameMovieServiceMovieReleaseDate]: args.releaseDate,
                })
                .returning(ColNameMovieServiceMovieId)
                .into(TabNameMovieServiceMovieTab);
            return +rows[0][ColNameMovieServiceMovieId];
        } catch (error) {
            this.logger.error("failed to create movie", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateMovie(args: UpdateMovieArguments): Promise<void> {
        try {
            await this.knex
                .table(TabNameMovieServiceMovieTab)
                .update({
                    [ColNameMovieServiceOfMovieTypeId]: args.of_movie_type_id,
                    [ColNameMovieServiceMovieTitle]: args.title,
                    [ColNameMovieServiceMovieDescription]: args.description,
                    [ColNameMovieServiceMovieDuration]: args.duration,
                    [ColNameMovieServiceMovieReleaseDate]: args.releaseDate,
                })
                .where({
                    [ColNameMovieServiceMovieId]: args.movieId
                })
        } catch (error) {
            this.logger.error("failed to update movie", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteMovie(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceMovieTab)
                .where({
                    [ColNameMovieServiceMovieId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete movie", { movieId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no movie with movie_id found", { userRoleId: id, });
            throw new ErrorWithStatus(`no movie with movie_id ${id} found`, status.NOT_FOUND);
        }

    }

    public async getMovieById(id: number): Promise<Movie | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTab)
                .leftOuterJoin(
                    TabNameMovieServiceMovieTypeTab,
                    `${TabNameMovieServiceMovieTab}.${ColNameMovieServiceOfMovieTypeId}`,
                    `${TabNameMovieServiceMovieTypeTab}.${ColNameMovieServiceMovieTypeId} `
                )
                .leftOuterJoin(
                    TabNameMovieServiceMoviePosterTab,
                    `${TabNameMovieServiceMovieTab}.${ColNameMovieServiceMovieId}`,
                    `${TabNameMovieServiceMoviePosterTab}.${ColNameMovieServiceMoviePosterOfMovieId} `
                )
                .leftOuterJoin(
                    TabNameMovieServiceMovieTrailerTab,
                    `${TabNameMovieServiceMovieTab}.${ColNameMovieServiceMovieId}`,
                    `${TabNameMovieServiceMovieTrailerTab}.${ColNameMovieServiceMovieTrailerOfMovieId} `
                )
                .where(ColNameMovieServiceMovieId, "=", id);
        } catch (error) {
            this.logger.error("failed to get movie", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no movie with movie id found", { id });
            return null;
        }

        return this.getMovieFromJoinedRow(rows[0]);
    }

    public async getMovieByIdWithXLock(id: number): Promise<Movie | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTab)
                .where({
                    [ColNameMovieServiceMovieId]: id
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get movie", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no movie with movie id found", { id });
            return null;
        }

        return this.getMovieFromRow(rows[0]);
    }

    public async getCurrentShowingMovieList(requestTime: number): Promise<Movie[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTab)
                .leftOuterJoin(
                    TabNameMovieServiceMoviePosterTab,
                    `${TabNameMovieServiceMovieTab}.${ColNameMovieServiceMovieId} `,
                    `${TabNameMovieServiceMoviePosterTab}.${ColNameMovieServiceMoviePosterOfMovieId} `,
                )
                .where(ColNameMovieServiceMovieReleaseDate, "<=", requestTime);

            return rows.map(row => this.getMovieFromJoinedRow(row));
        } catch (error) {
            this.logger.error("fail to get current showing movie list", { requestTime, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUpcomingMovieList(requestTime: number): Promise<Movie[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTab)
                .leftOuterJoin(
                    TabNameMovieServiceMoviePosterTab,
                    `${TabNameMovieServiceMovieTab}.${ColNameMovieServiceMovieId} `,
                    `${TabNameMovieServiceMoviePosterTab}.${ColNameMovieServiceMoviePosterOfMovieId} `,
                )
                .where(ColNameMovieServiceMovieReleaseDate, ">", requestTime);

            return rows.map(row => this.getMovieFromJoinedRow(row));
        } catch (error) {
            this.logger.error("fail to get current showing movie list", { requestTime, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getMovieByTitleWithXLock(title: string): Promise<Movie | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTab)
                .where({
                    [ColNameMovieServiceMovieTitle]: title
                })
                .forUpdate();

        } catch (error) {
            this.logger.error("failed to get movie by title", {
                title
            })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no movie with title found", { title });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one movie with title", { title });
            throw ErrorWithStatus.wrapWithStatus("more than one movie with title", status.INTERNAL);
        }

        return this.getMovieFromRow(rows[0]);
    }

    public async withTransaction<T>(cb: (dataAccessor: MovieDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getMovieFromRow(row: Record<string, any>): Movie {
        let poster: MoviePoster | null = null;
        if (row[ColNameMovieServiceMoviePosterOfMovieId]) {
            poster = new MoviePoster(+row[ColNameMovieServiceMoviePosterOfMovieId], "", "");
        }

        let trailer: MovieTrailer | null = null;
        if (row[ColNameMovieServiceMovieTrailerOfMovieId]) {
            trailer = new MovieTrailer(+row[ColNameMovieServiceMovieTrailerOfMovieId], "");
        }

        let movieType: MovieType | null = null;
        if (row[ColNameMovieServiceOfMovieTypeId]) {
            movieType = new MovieType(+row[ColNameMovieServiceOfMovieTypeId], "");
        }

        return new Movie(
            +row[ColNameMovieServiceMovieId],
            row[ColNameMovieServiceMovieTitle],
            row[ColNameMovieServiceMovieDescription],
            +row[ColNameMovieServiceMovieDuration],
            +row[ColNameMovieServiceMovieReleaseDate],
            movieType,
            trailer,
            poster,
        );
    }

    private getMovieFromJoinedRow(row: Record<string, any>): Movie {
        let poster: MoviePoster | null = null;
        if (row[ColNameMovieServiceMoviePosterOfMovieId]) {
            poster = new MoviePoster(
                +row[ColNameMovieServiceMoviePosterOfMovieId],
                row[ColNameMovieServiceMoviePosterOriginalFileName],
                row[ColNameMovieServiceMoviePosterOriginalImageFileName],
            );
        }

        let trailer: MovieTrailer | null = null;
        if (row[ColNameMovieServiceMovieTrailerOfMovieId]) {
            trailer = new MovieTrailer(
                +row[ColNameMovieServiceMovieTrailerOfMovieId],
                row[ColNameMovieServiceMovieTrailerYoutubeLinkUrl],
            );
        }

        let movieType: MovieType | null = null;
        if (row[ColNameMovieServiceOfMovieTypeId]) {
            movieType = new MovieType(
                +row[ColNameMovieServiceOfMovieTypeId],
                row[ColNameMovieServiceMovieTypeDisplayname]
            );
        }

        return new Movie(
            +row[ColNameMovieServiceMovieId],
            row[ColNameMovieServiceMovieTitle],
            row[ColNameMovieServiceMovieDescription],
            +row[ColNameMovieServiceMovieDuration],
            +row[ColNameMovieServiceMovieReleaseDate],
            movieType,
            trailer,
            poster,
        );
    }
}

injected(MovieDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_DATA_ACCESSOR_TOKEN = token<MovieDataAccessor>("MovieDataAccessor");