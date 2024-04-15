import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { MovieGenre } from "./models";

export interface MovieHasMovieGenreDataAccessor {
    createMovieHasMovieGenre(movieId: number, movieGenreId: number): Promise<void>;
    deleteMovieHasMovieGenre(movieId: number, movieGenreId: number): Promise<void>;
    getMovieGenreListByMovieId(movieId: number): Promise<MovieGenre[]>;
    withTransaction<T>(cb: (dataAccessor: MovieHasMovieGenreDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieHasMovieGenreTab = "movie_service_movie_has_movie_genre_tab";
const ColNameMovieServiceMovieHasMovieGenreMovieId = "movie_id";
const ColNameMovieServiceMovieHasMovieGenreMovieGenreId = "movie_genre_id";

const TabNameMovieServiceMovieGenreTab = "movie_service_movie_genre_tab";
const ColNameMovieServiceMovieGenreId = "movie_genre_id";
const ColNameMovieServiceMovieDisplayName = "display_name";


export class MovieHasMovieGenreDataAccessorImpl implements MovieHasMovieGenreDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createMovieHasMovieGenre(movieId: number, movieGenreId: number): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameMovieServiceMovieHasMovieGenreMovieId]: movieId,
                    [ColNameMovieServiceMovieHasMovieGenreMovieGenreId]: movieGenreId
                })
                .into(TabNameMovieServiceMovieHasMovieGenreTab);
        } catch (error) {
            this.logger.error("failed to create movie has movie genre relation", { movieId, movieGenreId, error, });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteMovieHasMovieGenre(movieId: number, movieGenreId: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceMovieHasMovieGenreTab)
                .where({
                    [ColNameMovieServiceMovieHasMovieGenreMovieId]: movieId,
                    [ColNameMovieServiceMovieHasMovieGenreMovieGenreId]: movieGenreId,
                });
        } catch (error) {
            this.logger.error("failed to delete movie has movie genre relation", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no movie has movie genre relation found", { movie_id: movieId }, { movie_gere_id: movieGenreId });
            throw new ErrorWithStatus(
                `no movie has movie genre relation found with movie_id ${movieId}, movie_genre_id ${movieGenreId}`,
                status.NOT_FOUND
            );
        }
    }

    public async getMovieGenreListByMovieId(movieId: number): Promise<MovieGenre[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieHasMovieGenreTab)
                .join(
                    TabNameMovieServiceMovieGenreTab,
                    `${TabNameMovieServiceMovieHasMovieGenreTab}.${ColNameMovieServiceMovieHasMovieGenreMovieGenreId}`,
                    `${TabNameMovieServiceMovieGenreTab}.${ColNameMovieServiceMovieGenreId}`
                )
                .where(({
                    [ColNameMovieServiceMovieHasMovieGenreMovieId]: movieId
                }));

            return rows.map((row) => new MovieGenre(
                +row[ColNameMovieServiceMovieHasMovieGenreMovieGenreId],
                row[ColNameMovieServiceMovieDisplayName]
            ));
        } catch (error) {
            this.logger.error("failed to movie genre list by movie id", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: MovieHasMovieGenreDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieHasMovieGenreDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(MovieHasMovieGenreDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_HAS_MOVIE_GENRE_DATA_ACCESSOR_TOKEN = token<MovieHasMovieGenreDataAccessor>("MovieHasMovieGenreDataAccessor");