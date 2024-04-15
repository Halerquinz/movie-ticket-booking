import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { MovieTrailer } from "./models";

export interface MovieTrailerDataAccessor {
    createMovieTrailer(ofMovieId: number, youtubeLinkUrl: string): Promise<number>;
    getMovieTrailerByMovieId(ofMovieId: number): Promise<MovieTrailer | null>;
    getMovieTrailerByMovieIdWithXLock(ofMovieId: number): Promise<MovieTrailer | null>;
    deleteMovieTrailer(id: number): Promise<void>;
    withTransaction<T>(cb: (dataAccessor: MovieTrailerDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieTrailerTab = "movie_service_movie_trailer_tab";
const ColNameMovieServiceMovieTrailerOfMovieId = "of_movie_id";
const ColNameMovieServiceMovieTrailerYoutubeLinkUrl = "youtube_link_url";

export class MovieTrailerDataAccessorImpl implements MovieTrailerDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createMovieTrailer(ofMovieId: number, youtubeLinkUrl: string): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceMovieTrailerOfMovieId]: ofMovieId,
                    [ColNameMovieServiceMovieTrailerYoutubeLinkUrl]: youtubeLinkUrl
                })
                .returning(ColNameMovieServiceMovieTrailerYoutubeLinkUrl)
                .into(TabNameMovieServiceMovieTrailerTab);
            return +rows[0][ColNameMovieServiceMovieTrailerOfMovieId];
        } catch (error) {
            this.logger.error("failed to create movie trailer", { youtubeLinkUrl, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getMovieTrailerByMovieId(ofMovieId: number): Promise<MovieTrailer | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTrailerTab)
                .where({
                    [ColNameMovieServiceMovieTrailerOfMovieId]: ofMovieId
                });
        } catch (error) {
            this.logger.error("failed to get movie trailer", { ofMovieId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no movie trailer of movie id  found", { ofMovieId });
            return null;
        }

        return rows[0];
    }

    public async getMovieTrailerByMovieIdWithXLock(ofMovieId: number): Promise<MovieTrailer | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTrailerTab)
                .where({
                    [ColNameMovieServiceMovieTrailerOfMovieId]: ofMovieId
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get movie trailer", { ofMovieId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no movie trailer of movie id  found", { ofMovieId });
            return null;
        }

        return rows[0];
    }

    public async deleteMovieTrailer(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceMovieTrailerTab)
                .where({
                    [ColNameMovieServiceMovieTrailerOfMovieId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete movie trailer", { movieId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no movie trailer with movie_id found", { movieId: id, });
            throw new ErrorWithStatus(`no movie trailer with movie_id ${id} found`, status.NOT_FOUND);
        }

    }

    public async withTransaction<T>(cb: (dataAccessor: MovieTrailerDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieTrailerDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(MovieTrailerDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_TRAILER_DATA_ACCESSOR_TOKEN = token<MovieTrailerDataAccessor>("MovieTrailerDataAccessor");