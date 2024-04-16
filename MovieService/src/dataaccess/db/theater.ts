import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Theater } from "./models";

export interface CreateTheaterArguments {
    displayName: string;
    location: string;
}

export interface UpdateTheaterArguments {
    theaterId: number;
    displayName: string;
    location: string;
}

export interface TheaterDataAccessor {
    createTheater(args: CreateTheaterArguments): Promise<number>;
    updateTheater(args: UpdateTheaterArguments): Promise<void>;
    deleteTheater(id: number): Promise<void>;
    getTheaterById(id: number): Promise<Theater | null>;
    getTheaterByIdWithXLock(id: number): Promise<Theater | null>;
    getTheaterList(): Promise<Theater[]>;
    withTransaction<T>(cb: (dataAccessor: TheaterDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceTheaterTab = "movie_service_theater_tab";
const ColNameMovieServiceTheaterId = "theater_id";
const ColNameMovieServiceTheaterDisplayName = "display_name";
const ColNameMovieServiceTheaterLocation = "location";
const ColNameMovieServiceTheaterScreenCount = "screen_count";
const ColNameMovieServiceTheaterSeatCount = "seat_count";

export class TheaterDataAccessorImpl implements TheaterDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createTheater(args: CreateTheaterArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceTheaterDisplayName]: args.displayName,
                    [ColNameMovieServiceTheaterLocation]: args.location
                })
                .returning(ColNameMovieServiceTheaterId)
                .into(TabNameMovieServiceTheaterTab);
            return +rows[0][ColNameMovieServiceTheaterId];
        } catch (error) {
            this.logger.error("failed to create theater", { theater: { name: args.displayName, location: args.location }, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateTheater(args: UpdateTheaterArguments): Promise<void> {
        try {
            await this.knex
                .table(TabNameMovieServiceTheaterTab)
                .update({
                    [ColNameMovieServiceTheaterDisplayName]: args.displayName,
                    [ColNameMovieServiceTheaterLocation]: args.location
                })
                .where({
                    [ColNameMovieServiceTheaterId]: args.theaterId
                });
        } catch (error) {
            this.logger.error("failed to update theater", { theaterId: args.theaterId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteTheater(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceTheaterTab)
                .where({
                    [ColNameMovieServiceTheaterId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete theater", { theaterId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no theater with theaterId found", { theaterId: id, });
            throw new ErrorWithStatus(`no theater with theaterId ${id} found`, status.NOT_FOUND);
        }
    }

    public async getTheaterById(id: number): Promise<Theater | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceTheaterTab)
                .where({
                    [ColNameMovieServiceTheaterId]: id
                });
        } catch (error) {
            this.logger.error("failed to get theater", { theaterId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no theater of theater id  found", { theaterId: id, });
            return null;
        }

        return this.getTheaterFromRow(rows[0]);
    }

    public async getTheaterByIdWithXLock(id: number): Promise<Theater | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceTheaterTab)
                .where({
                    [ColNameMovieServiceTheaterId]: id
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get theater", { theaterId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no theater of theater id  found", { theaterId: id, });
            return null;
        }

        return this.getTheaterFromRow(rows[0]);
    }

    public async getTheaterList(): Promise<Theater[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceTheaterTab)

            return rows.map(row => new Theater(
                +row[ColNameMovieServiceTheaterId],
                row[ColNameMovieServiceTheaterDisplayName],
                row[ColNameMovieServiceTheaterLocation],
                +row[ColNameMovieServiceTheaterScreenCount],
                +row[ColNameMovieServiceTheaterSeatCount]
            )) || [];
        } catch (error) {
            this.logger.error("failed to get theater list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: TheaterDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new TheaterDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getTheaterFromRow(row: Record<string, any>): Theater {
        return new Theater(
            +row[ColNameMovieServiceTheaterId],
            row[ColNameMovieServiceTheaterDisplayName],
            row[ColNameMovieServiceTheaterLocation],
            +row[ColNameMovieServiceTheaterScreenCount],
            +row[ColNameMovieServiceTheaterSeatCount]
        )
    }
}

injected(TheaterDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const THEATER_DATA_ACCESSOR_TOKEN = token<TheaterDataAccessor>("TheaterDataAccessor");