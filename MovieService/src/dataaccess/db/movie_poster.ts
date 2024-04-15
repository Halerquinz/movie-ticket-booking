import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { MoviePoster } from "./models";

export interface CreateMoviePosterArguments {
    ofMovieId: number,
    originalFileName: string,
    originalImageFileName: string,
}

export interface MoviePosterDataAccessor {
    createMoviePoster(args: CreateMoviePosterArguments): Promise<number>;
    getMoviePosterByMovieId(ofMovieId: number): Promise<MoviePoster | null>;
    deleteMoviePoster(id: number): Promise<void>;
    withTransaction<T>(cb: (dataAccessor: MoviePosterDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMoviePosterTab = "movie_service_movie_poster_tab";
const ColNameMovieServiceMoviePosterOfMovieId = "of_movie_id";
const ColNameMovieServiceMoviePosterOriginalFileName = "original_filename";
const ColNameMovieServiceMoviePosterOriginalImageFileName = "original_image_filename";


export class MoviePosterDataAccessorImpl implements MoviePosterDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createMoviePoster(args: CreateMoviePosterArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceMoviePosterOfMovieId]: args.ofMovieId,
                    [ColNameMovieServiceMoviePosterOriginalFileName]: args.originalFileName,
                    [ColNameMovieServiceMoviePosterOriginalImageFileName]: args.originalImageFileName,
                })
                .returning(ColNameMovieServiceMoviePosterOfMovieId)
                .into(TabNameMovieServiceMoviePosterTab);
            return +rows[0][ColNameMovieServiceMoviePosterOfMovieId];
        } catch (error) {
            this.logger.error("failed to create movie poster", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getMoviePosterByMovieId(ofMovieId: number): Promise<MoviePoster | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMoviePosterTab)
                .where({
                    [ColNameMovieServiceMoviePosterOfMovieId]: ofMovieId
                })
        } catch (error) {
            this.logger.error("failed to get movie poster", { idd: ofMovieId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no movie poster of movie id found", { id: ofMovieId });
            return null;
        }

        return rows[0];
    }

    public async deleteMoviePoster(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceMoviePosterTab)
                .where({
                    [ColNameMovieServiceMoviePosterOfMovieId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete movie poster", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no movie poster with movie_id found", { ofMovieId: id, });
            throw new ErrorWithStatus(`no movie poster with movie_id ${id} found`, status.NOT_FOUND);
        }

    }

    public async withTransaction<T>(cb: (dataAccessor: MoviePosterDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MoviePosterDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(MoviePosterDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_POSTER_DATA_ACCESSOR_TOKEN = token<MoviePosterDataAccessor>("MoviePosterDataAccessor");