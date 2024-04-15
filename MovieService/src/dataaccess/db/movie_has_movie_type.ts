import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { MovieType } from "./models";

export interface MovieHasMovieTypeDataAccessor {
    createMovieHasMovieType(movieId: number, movieTypeId: number): Promise<void>;
    deleteMovieHasMovieType(movieId: number, movieTypeId: number): Promise<void>;
    getMovieTypeListByMovieId(movieId: number): Promise<MovieType[]>;
    withTransaction<T>(cb: (dataAccessor: MovieHasMovieTypeDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieHasMovieTypeTab = "movie_service_movie_has_movie_type_tab";
const ColNameMovieServiceMovieHasMovieTypeMovieId = "movie_id";
const ColNameMovieServiceMovieHasMovieTypeMovieTypeId = "movie_type_id";

const TabNameMovieServiceMovieTypeTab = "movie_service_movie_type_tab";
const ColNameMovieServiceMovieTypeId = "movie_type_id";
const ColNameMovieServiceMovieDisplayName = "display_name";


export class MovieHasMovieTypeDataAccessorImpl implements MovieHasMovieTypeDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createMovieHasMovieType(movieId: number, movieTypeId: number): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameMovieServiceMovieHasMovieTypeMovieId]: movieId,
                    [ColNameMovieServiceMovieHasMovieTypeMovieTypeId]: movieTypeId
                })
                .into(TabNameMovieServiceMovieHasMovieTypeTab);
        } catch (error) {
            this.logger.error("failed to create movie has movie type relation", { movieId, movieTypeId, error, });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteMovieHasMovieType(movieId: number, movieTypeId: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceMovieHasMovieTypeTab)
                .where({
                    [ColNameMovieServiceMovieHasMovieTypeMovieId]: movieId,
                    [ColNameMovieServiceMovieHasMovieTypeMovieTypeId]: movieTypeId,
                });
        } catch (error) {
            this.logger.error("failed to delete movie has movie type relation", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no movie has movie type relation found", { movie_id: movieId }, { movie_gere_id: movieTypeId });
            throw new ErrorWithStatus(
                `no movie has movie type relation found with movie_id ${movieId}, movie_type_id ${movieTypeId}`,
                status.NOT_FOUND
            );
        }
    }

    public async getMovieTypeListByMovieId(movieId: number): Promise<MovieType[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieHasMovieTypeTab)
                .join(
                    TabNameMovieServiceMovieTypeTab,
                    `${TabNameMovieServiceMovieHasMovieTypeTab}.${ColNameMovieServiceMovieHasMovieTypeMovieTypeId}`,
                    `${TabNameMovieServiceMovieTypeTab}.${ColNameMovieServiceMovieTypeId}`
                )
                .where(({
                    [ColNameMovieServiceMovieHasMovieTypeMovieId]: movieId
                }));

            return rows.map((row) => new MovieType(
                +row[ColNameMovieServiceMovieHasMovieTypeMovieTypeId],
                row[ColNameMovieServiceMovieDisplayName]
            ));
        } catch (error) {
            this.logger.error("failed to get movie type list by movie id", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: MovieHasMovieTypeDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieHasMovieTypeDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(MovieHasMovieTypeDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_HAS_MOVIE_TYPE_DATA_ACCESSOR_TOKEN = token<MovieHasMovieTypeDataAccessor>("MovieHasMovieTypeDataAccessor");