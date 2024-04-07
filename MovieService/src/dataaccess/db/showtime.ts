import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Showtime } from "./models";

export enum ShowtimeType {
    Subtitle = 1,
    Dubbing = 2
}

export interface CreateShowtimeArguments {
    ofMovieId: number,
    ofScreenId: number,
    timeStart: number,
    timeEnd: number,
    showtimeType: ShowtimeType
}

export interface UpdateShowtimeArguments {
    showtimeId: number,
    ofMovieId: number,
    ofScreenId: number,
    timeStart: number,
    timeEnd: number,
    showtimeType: ShowtimeType
}

export interface ShowtimeDataAccessor {
    createShowtime(args: CreateShowtimeArguments): Promise<number>;
    updateShowtime(args: UpdateShowtimeArguments): Promise<void>;
    deleteShowtime(id: number): Promise<void>;
    getShowtime(id: number): Promise<Showtime | null>;
    getShowtimeList(): Promise<Showtime[]>;
    withTransaction<T>(cb: (dataAccessor: ShowtimeDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceShowtimeTab = "movie_service_showtime_tab";
const ColNameMovieServiceShowtimeId = "showtime_id";
const ColNameMovieServiceShowtimeOfMovieId = "of_movie_id";
const ColNameMovieServiceShowtimeOfScreenId = "of_screen_id";
const ColNameMovieServiceShowtimeTimeStart = "time_start";
const ColNameMovieServiceShowtimeTimeEnd = "time_end";
const ColNameMovieServiceShowtimeType = "showtime_type";

export class ShowtimeDataAccessorImpl implements ShowtimeDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createShowtime(args: CreateShowtimeArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceShowtimeOfMovieId]: args.ofMovieId,
                    [ColNameMovieServiceShowtimeOfScreenId]: args.ofScreenId,
                    [ColNameMovieServiceShowtimeTimeStart]: args.timeStart,
                    [ColNameMovieServiceShowtimeTimeEnd]: args.timeEnd,
                    [ColNameMovieServiceShowtimeType]: args.showtimeType,
                })
                .returning(ColNameMovieServiceShowtimeId)
                .into(TabNameMovieServiceShowtimeTab);
            return +rows[0][ColNameMovieServiceShowtimeId];
        } catch (error) {
            this.logger.error("failed to create showtime", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateShowtime(args: UpdateShowtimeArguments): Promise<void> {
        try {
            await this.knex
                .table(TabNameMovieServiceShowtimeTab)
                .update({
                    [ColNameMovieServiceShowtimeOfMovieId]: args.ofMovieId,
                    [ColNameMovieServiceShowtimeOfScreenId]: args.ofScreenId,
                    [ColNameMovieServiceShowtimeTimeStart]: args.timeStart,
                    [ColNameMovieServiceShowtimeTimeEnd]: args.timeEnd,
                    [ColNameMovieServiceShowtimeType]: args.showtimeType,
                })
                .where({
                    [ColNameMovieServiceShowtimeId]: args.showtimeId
                });
        } catch (error) {
            this.logger.error("failed to update showtime", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteShowtime(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceShowtimeTab)
                .where({
                    [ColNameMovieServiceShowtimeId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete showtime", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no showtime with id found", { id });
            throw new ErrorWithStatus(`no showtime with showtimeId ${id} found`, status.NOT_FOUND);
        }
    }

    public async getShowtime(id: number): Promise<Showtime | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceShowtimeTab)
                .where({
                    [ColNameMovieServiceShowtimeId]: id
                })
        } catch (error) {
            this.logger.error("failed to get showtime", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no showtime with showtime id found", { id, });
            return null;
        }

        return rows[0];
    }

    public async getShowtimeList(): Promise<Showtime[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceShowtimeTab)

            return rows.map(row => new Showtime(
                +row[ColNameMovieServiceShowtimeId],
                +row[ColNameMovieServiceShowtimeOfMovieId],
                +row[ColNameMovieServiceShowtimeOfScreenId],
                +row[ColNameMovieServiceShowtimeTimeStart],
                +row[ColNameMovieServiceShowtimeTimeEnd],
                +row[ColNameMovieServiceShowtimeType]
            )) || [];
        } catch (error) {
            this.logger.error("failed to get showtime list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: ShowtimeDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new ShowtimeDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(ShowtimeDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SHOWTIME_DATA_ACCESSOR_TOKEN = token<ShowtimeDataAccessor>("ShowtimeDataAccessor");