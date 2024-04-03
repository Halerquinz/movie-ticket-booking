import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Movie, MovieGenre } from "./models";

export interface MovieGenreDataAccessor {
    createMovieGenre(display_name: string): Promise<number>;
    updateMovieGenre(movieGenre: MovieGenre): Promise<void>;
    deleteMovieGenre(id: number): Promise<void>;
    getMovieGenreById(id: number): Promise<MovieGenre | null>;
    getMovieGenreByIdWithXLock(id: number): Promise<MovieGenre | null>;
    getMovieGenreByDisplayName(displayName: string): Promise<MovieGenre | null>;
    getMovieGenreByDisplayNameWithXLock(displayName: string): Promise<MovieGenre | null>;
    getMovieGenreList(): Promise<MovieGenre[]>;
    withTransaction<T>(cb: (dataAccessor: MovieGenreDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieGenreTab = "movie_service_movie_genre_tab";
const ColNameMovieServiceMovieGenreId = "movie_genre_id";
const ColNameMovieServiceMovieGenreDisplayName = "display_name";

export class MovieGenreDataAccessorImpl implements MovieGenreDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createMovieGenre(display_name: string): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceMovieGenreDisplayName]: display_name
                })
                .returning(ColNameMovieServiceMovieGenreId)
                .into(TabNameMovieServiceMovieGenreTab);
            return +rows[0][ColNameMovieServiceMovieGenreId];
        } catch (error) {
            this.logger.error("failed to create movie genre", { display_name, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateMovieGenre(movieGenre: MovieGenre): Promise<void> {
        try {
            await this.knex
                .table(TabNameMovieServiceMovieGenreTab)
                .update({
                    [ColNameMovieServiceMovieGenreDisplayName]: movieGenre.displayName
                })
                .where({
                    [ColNameMovieServiceMovieGenreId]: movieGenre.movieGenreId
                })
        } catch (error) {
            this.logger.error("failed to update movie genre", { movieGenre, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

    }

    public async deleteMovieGenre(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceMovieGenreTab)
                .where({
                    [ColNameMovieServiceMovieGenreId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete movie genre", { movieGenreId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no movie genre with movie_genre_id found", { userRoleId: id, });
            throw new ErrorWithStatus(`no movie genre with movie_genre_id ${id} found`, status.NOT_FOUND);
        }
    }

    public async getMovieGenreById(id: number): Promise<MovieGenre | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieGenreTab)
                .where({
                    [ColNameMovieServiceMovieGenreId]: id
                });
        } catch (error) {
            this.logger.error("failed to get movie genre by id", {
                id
            })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found movie genre with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one movie genre with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one user with userId", status.INTERNAL);
        }

        return this.getMovieGenreFromRow(rows[0]);
    }

    public async getMovieGenreByIdWithXLock(id: number): Promise<MovieGenre | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieGenreTab)
                .where({
                    [ColNameMovieServiceMovieGenreId]: id
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get movie genre by id", {
                id
            })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found movie genre with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one movie genre with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one user with userId", status.INTERNAL);
        }

        return this.getMovieGenreFromRow(rows[0]);
    }

    public async getMovieGenreByDisplayName(displayName: string): Promise<MovieGenre | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieGenreTab)
                .where({
                    [ColNameMovieServiceMovieGenreDisplayName]: displayName
                });
        } catch (error) {
            this.logger.error("failed to get movie genre by displayname", {
                displayName
            })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found movie genre with displayname", { displayName });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one movie genre with displayname", { displayName });
            throw ErrorWithStatus.wrapWithStatus("more than one user with userId", status.INTERNAL);
        }

        return this.getMovieGenreFromRow(rows[0]);
    }

    public async getMovieGenreByDisplayNameWithXLock(displayName: string): Promise<MovieGenre | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieGenreTab)
                .where({
                    [ColNameMovieServiceMovieGenreDisplayName]: displayName
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get movie genre by displayname", {
                displayName
            })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found movie genre with displayname", { displayName });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one movie genre with displayname", { displayName });
            throw ErrorWithStatus.wrapWithStatus("more than one user with userId", status.INTERNAL);
        }

        return this.getMovieGenreFromRow(rows[0]);
    }

    public async getMovieGenreList(): Promise<MovieGenre[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieGenreTab)
                .orderBy(ColNameMovieServiceMovieGenreId);
            return rows.map((row) => this.getMovieGenreFromRow(row));
        } catch (error) {
            this.logger.error("failed to get movie genre list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: MovieGenreDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieGenreDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getMovieGenreFromRow(row: Record<string, any>): MovieGenre {
        return new MovieGenre(
            +row[ColNameMovieServiceMovieGenreId],
            row[ColNameMovieServiceMovieGenreDisplayName]
        );
    }
}

injected(MovieGenreDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_GENRE_DATA_ACCESSOR_TOKEN = token<MovieGenreDataAccessor>("MovieGenreDataAccessor");