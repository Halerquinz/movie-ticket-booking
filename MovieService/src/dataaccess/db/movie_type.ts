import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { MovieType } from "./models";

export interface MovieTypeDataAccessor {
    getMovieTypeById(id: number): Promise<MovieType | null>;
    getMovieTypeByIdWithXLock(id: number): Promise<MovieType | null>;
    withTransaction<T>(cb: (dataAccessor: MovieTypeDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieTypeTab = "movie_service_movie_type_tab";
const ColNameMovieServiceMovieTypeId = "movie_type_id";
const ColNameMovieServiceMovieTypeDisplayName = "display_name";

export class MovieTypeDataAccessorImpl implements MovieTypeDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async getMovieTypeById(id: number): Promise<MovieType | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTypeTab)
                .where({
                    [ColNameMovieServiceMovieTypeId]: id
                });
        } catch (error) {
            this.logger.error("failed to get movie type by id", { id });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found movie type with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one movie type with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one movie type with id", status.INTERNAL);
        }

        return this.getMovieTypeFromRow(rows[0]);
    }

    public async getMovieTypeByIdWithXLock(id: number): Promise<MovieType | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTypeTab)
                .where({
                    [ColNameMovieServiceMovieTypeId]: id
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get movie type by id", { id });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found movie type with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one movie type with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one movie type with id", status.INTERNAL);
        }

        return this.getMovieTypeFromRow(rows[0]);
    }

    public async withTransaction<T>(cb: (dataAccessor: MovieTypeDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieTypeDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getMovieTypeFromRow(row: Record<string, any>): MovieType {
        return new MovieType(
            +row[ColNameMovieServiceMovieTypeId],
            row[ColNameMovieServiceMovieTypeDisplayName],
        );
    }
}

injected(MovieTypeDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_TYPE_DATA_ACCESSOR_TOKEN = token<MovieTypeDataAccessor>("MovieTypeDataAccessor");