import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { MovieImage } from "./models";

export interface CreateMovieImageArguments {
    ofMovieId: number,
    originalFileName: string,
    originalImageFileName: string,
}

export interface MovieImageDataAccessor {
    createMovieImage(args: CreateMovieImageArguments): Promise<number>;
    getMovieImage(ofMovieId: number): Promise<MovieImage[]>;
    getMovieImageListByMovieId(ofMovieId: number): Promise<MovieImage[]>;
    deleteMovieImage(ofMovieId: number): Promise<void>;
    withTransaction<T>(cb: (dataAccessor: MovieImageDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieImageTab = "movie_service_movie_image_tab";
const ColNameMovieServiceMovieImageId = "image_id";
const ColNameMovieServiceMovieImageOfMovieId = "of_movie_id";
const ColNameMovieServiceMovieOriginalFileName = "original_file_name";
const ColNameMovieServiceMovieOriginalImageFileName = "original_image_filename";

export class MovieImageDataAccessorImpl implements MovieImageDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createMovieImage(args: CreateMovieImageArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceMovieOriginalFileName]: args.originalFileName,
                    [ColNameMovieServiceMovieOriginalImageFileName]: args.originalImageFileName,
                    [ColNameMovieServiceMovieImageOfMovieId]: args.ofMovieId
                })
                .returning(ColNameMovieServiceMovieImageId)
                .into(TabNameMovieServiceMovieImageTab);
            return +rows[0][ColNameMovieServiceMovieImageId];
        } catch (error) {
            this.logger.error("failed to create movie image", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getMovieImage(ofMovieId: number): Promise<MovieImage[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieImageTab)
                .where({
                    [ColNameMovieServiceMovieImageOfMovieId]: ofMovieId
                })

            return rows.map(row => new MovieImage(
                +row[ColNameMovieServiceMovieImageId],
                +row[ColNameMovieServiceMovieImageOfMovieId],
                row[ColNameMovieServiceMovieOriginalFileName],
                row[ColNameMovieServiceMovieOriginalImageFileName],
            )) || [];
        } catch (error) {
            this.logger.error("failed to get movie image", { ofMovieId: ofMovieId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getMovieImageListByMovieId(ofMovieId: number): Promise<MovieImage[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieImageTab)
                .where({
                    [ColNameMovieServiceMovieImageOfMovieId]: ofMovieId
                });

            return rows.map((row) => this.getMovieImageFromRow(row));
        } catch (error) {
            this.logger.error("failed to get movie image list with movie id", { ofMovieId: ofMovieId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteMovieImage(imageId: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceMovieImageTab)
                .where({
                    [ColNameMovieServiceMovieImageId]: imageId
                });
        } catch (error) {
            this.logger.error("failed to delete movie image", { imageId: imageId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no movie image with imageId found", { imageId: imageId, });
            throw new ErrorWithStatus(`no movie image with ofMovieId ${imageId} found`, status.NOT_FOUND);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: MovieImageDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieImageDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getMovieImageFromRow(row: Record<string, any>): MovieImage {
        return new MovieImage(
            +row[ColNameMovieServiceMovieImageId],
            +row[ColNameMovieServiceMovieImageOfMovieId],
            row[ColNameMovieServiceMovieOriginalFileName],
            row[ColNameMovieServiceMovieOriginalImageFileName],
        )
    }
}

injected(MovieImageDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_IMAGE_DATA_ACCESSOR_TOKEN = token<MovieImageDataAccessor>("MovieImageDataAccessor");