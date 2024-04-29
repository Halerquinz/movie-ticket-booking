import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Showtime, ShowtimeDayOfTheWeek, ShowtimeDayOfTheWeekType, ShowtimeSlot, ShowtimeSlotType } from "./models";

export interface CreateShowtimeArguments {
    ofMovieId: number,
    ofScreenId: number,
    timeStart: number,
    timeEnd: number,
    of_showtime_slot_id: ShowtimeSlotType,
    of_showtime_day_of_the_week_id: ShowtimeDayOfTheWeekType
}

export interface UpdateShowtimeArguments {
    showtimeId: number,
    ofMovieId: number,
    ofScreenId: number,
    timeStart: number,
    timeEnd: number,
    of_showtime_slot_id: ShowtimeSlotType,
    of_showtime_day_of_the_week_id: ShowtimeDayOfTheWeekType
}

export interface ShowtimeDataAccessor {
    createShowtime(args: CreateShowtimeArguments): Promise<number>;
    updateShowtime(args: UpdateShowtimeArguments): Promise<void>;
    deleteShowtime(id: number): Promise<void>;
    getShowtime(id: number): Promise<Showtime | null>;
    getShowtimeList(): Promise<Showtime[]>;
    getShowtimeListOfTheaterId(
        theaterId: number,
        requestTime: number,
        showtimeRange: number
    ): Promise<Showtime[]>;
    getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number,
        showtimeRange: number
    ): Promise<Showtime[]>;
    withTransaction<T>(cb: (dataAccessor: ShowtimeDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceShowtimeTab = "movie_service_showtime_tab";
const ColNameMovieServiceShowtimeId = "showtime_id";
const ColNameMovieServiceShowtimeOfMovieId = "of_movie_id";
const ColNameMovieServiceShowtimeOfScreenId = "of_screen_id";
const ColNameMovieServiceShowtimeTimeStart = "time_start";
const ColNameMovieServiceShowtimeTimeEnd = "time_end";
const ColNameMovieServiceShowtimeOfShowtimeSlotId = "of_showtime_slot_id";
const ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId = "of_showtime_day_of_the_week_id";

const TabNameMovieServiceScreenTab = "movie_service_screen_tab";
const ColNameMovieServiceScreenId = "screen_id";
const ColNameMovieServiceScreenOfTheaterId = "of_theater_id";
const ColNameMovieServiceScreenOfScreenTypeId = "of_screen_type_id";
const ColNameMovieServiceScreenDisplayName = "display_name";

const TabNameMovieServiceTheaterTab = "movie_service_theater_tab";
const ColNameMovieServiceTheaterId = "theater_id";
const ColNameMovieServiceTheaterDisplayName = "display_name";
const ColNameMovieServiceTheaterLocation = "location";
const ColNameMovieServiceTheaterScreenCount = "screen_count";
const ColNameMovieServiceTheaterSeatCount = "seat_count";

const TabNameMovieServiceMovieTab = "movie_service_movie_tab";
const ColNameMovieServiceMovieId = "movie_id";
const ColNameMovieServiceMovieTitle = "title";
const ColNameMovieServiceMovieDescription = "description";
const ColNameMovieServiceMovieDuration = "duration";
const ColNameMovieServiceMovieReleaseDate = "release_date";

const TabNameMovieServiceShowtimeSlot = "movie_service_showtime_slot_tab";
const ColNameMovieServiceShowtimeSlotId = "showtime_slot_id";
const ColNameMovieServiceShowtimeSlotDisplayName = "display_name";

const TabNameMovieServiceShowtimeDayOfTheWeek = "movie_service_showtime_day_of_the_week_tab";
const ColNameMovieServiceShowtimeDayOfTheWeekId = "showtime_day_of_the_week_id";
const ColNameMovieServiceShowtimeDayOfTheWeekDisplayName = "display_name";

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
                    [ColNameMovieServiceShowtimeOfShowtimeSlotId]: args.of_showtime_slot_id,
                    [ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId]: args.of_showtime_day_of_the_week_id
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
                    [ColNameMovieServiceShowtimeOfShowtimeSlotId]: args.of_showtime_slot_id,
                    [ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId]: args.of_showtime_day_of_the_week_id
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
                .select([
                    `${TabNameMovieServiceShowtimeTab}.*`,
                    `${TabNameMovieServiceShowtimeDayOfTheWeek}.${ColNameMovieServiceShowtimeDayOfTheWeekDisplayName} as day_of_the_week_displayname`,
                    `${TabNameMovieServiceShowtimeDayOfTheWeek}.${ColNameMovieServiceShowtimeDayOfTheWeekId}`,
                    `${TabNameMovieServiceShowtimeSlot}.${ColNameMovieServiceShowtimeSlotDisplayName} as slot_displayname`,
                    `${TabNameMovieServiceShowtimeSlot}.${ColNameMovieServiceShowtimeSlotId}`,
                ])
                .from(TabNameMovieServiceShowtimeTab)
                .leftOuterJoin(
                    TabNameMovieServiceShowtimeDayOfTheWeek,
                    `${TabNameMovieServiceShowtimeTab}.${ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId}`,
                    `${TabNameMovieServiceShowtimeDayOfTheWeek}.${ColNameMovieServiceShowtimeDayOfTheWeekId} `
                )
                .leftOuterJoin(
                    TabNameMovieServiceShowtimeSlot,
                    `${TabNameMovieServiceShowtimeTab}.${ColNameMovieServiceShowtimeOfShowtimeSlotId}`,
                    `${TabNameMovieServiceShowtimeSlot}.${ColNameMovieServiceShowtimeSlotId} `
                )
                .where({
                    [ColNameMovieServiceShowtimeId]: id
                });
        } catch (error) {
            this.logger.error("failed to get showtime", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no showtime with showtime id found", { id, });
            return null;
        }

        return this.getShowtimeFromJoinedRow(rows[0]);
    }

    public async getShowtimeList(): Promise<Showtime[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceShowtimeTab)

            return rows.map((row) => this.getShowtimeFromRow(row));
        } catch (error) {
            this.logger.error("failed to get showtime list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getShowtimeListOfTheaterId(
        theaterId: number,
        requestTime: number,
        showtimeRange: number
    ): Promise<Showtime[]> {
        try {
            const rows = await this.knex
                .select([
                    `showtime.*`,
                ])
                .from({ showtime: TabNameMovieServiceShowtimeTab })
                .join(
                    { screen: TabNameMovieServiceScreenTab },
                    `showtime.${ColNameMovieServiceShowtimeOfScreenId}`,
                    `screen.${ColNameMovieServiceScreenId}`
                )
                .join(
                    { theater: TabNameMovieServiceTheaterTab },
                    `screen.${ColNameMovieServiceScreenOfTheaterId}`,
                    `theater.${ColNameMovieServiceTheaterId}`
                )
                .where(`theater.${ColNameMovieServiceTheaterId}`, "=", theaterId)
                .whereRaw(`?? - ?? <= ?`, [`showtime.${ColNameMovieServiceShowtimeTimeStart}`, requestTime, showtimeRange])
                .orderBy(`showtime.${ColNameMovieServiceShowtimeOfMovieId}`, "asc")
                .orderBy(`showtime.${ColNameMovieServiceShowtimeTimeStart}`, "asc");

            return rows.map((row) => this.getShowtimeFromRow(row));
        } catch (error) {
            this.logger.error("failed to get showtime list", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }


    public async getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number,
        showtimeRange: number
    ): Promise<Showtime[]> {
        try {
            const rows = await this.knex
                .select([
                    `showtime.*`,
                ])
                .from({ showtime: TabNameMovieServiceShowtimeTab })
                .join(
                    { screen: TabNameMovieServiceScreenTab },
                    `showtime.${ColNameMovieServiceShowtimeOfScreenId}`,
                    `screen.${ColNameMovieServiceScreenId}`
                )
                .join(
                    { theater: TabNameMovieServiceTheaterTab },
                    `screen.${ColNameMovieServiceScreenOfTheaterId}`,
                    `theater.${ColNameMovieServiceTheaterId}`
                )
                .where(`theater.${ColNameMovieServiceTheaterId}`, "=", theaterId)
                .andWhere(`showtime.${ColNameMovieServiceShowtimeOfMovieId}`, "=", movieId)
                .whereRaw(`?? - ?? <= ?`, [`showtime.${ColNameMovieServiceShowtimeTimeStart}`, requestTime, showtimeRange])
                .orderBy(`showtime.${ColNameMovieServiceShowtimeOfMovieId}`, "asc")
                .orderBy(`showtime.${ColNameMovieServiceShowtimeTimeStart}`, "asc");

            return rows.map((row) => this.getShowtimeFromRow(row));
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

    private getShowtimeFromRow(row: Record<string, any>): Showtime {
        let showtimeSlot: ShowtimeSlot | null = null;
        if (row[ColNameMovieServiceShowtimeOfShowtimeSlotId]) {
            showtimeSlot = new ShowtimeSlot(+row[ColNameMovieServiceShowtimeOfShowtimeSlotId], "",)
        }

        let showtimeDayOfTheWeek: ShowtimeDayOfTheWeek | null = null;
        if (row[ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId]) {
            showtimeDayOfTheWeek = new ShowtimeDayOfTheWeek(+row[ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId], "",)
        }

        return new Showtime(
            +row[ColNameMovieServiceShowtimeId],
            +row[ColNameMovieServiceShowtimeOfMovieId],
            +row[ColNameMovieServiceShowtimeOfScreenId],
            +row[ColNameMovieServiceShowtimeTimeStart],
            +row[ColNameMovieServiceShowtimeTimeEnd],
            showtimeDayOfTheWeek,
            showtimeSlot
        )
    }

    private getShowtimeFromJoinedRow(row: Record<string, any>): Showtime {
        let showtimeSlot: ShowtimeSlot | null = null;
        if (row[ColNameMovieServiceShowtimeOfShowtimeSlotId]) {
            showtimeSlot = new ShowtimeSlot(
                +row[ColNameMovieServiceShowtimeOfShowtimeSlotId],
                row["slot_displayname"]
            )
        }

        let showtimeDayOfTheWeek: ShowtimeDayOfTheWeek | null = null;
        if (row[ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId]) {
            showtimeDayOfTheWeek = new ShowtimeDayOfTheWeek(
                +row[ColNameMovieServiceShowtimeOfShowtimeDayOfTheWeekId],
                row["day_of_the_week_displayname"]
            )
        }

        return new Showtime(
            +row[ColNameMovieServiceShowtimeId],
            +row[ColNameMovieServiceShowtimeOfMovieId],
            +row[ColNameMovieServiceShowtimeOfScreenId],
            +row[ColNameMovieServiceShowtimeTimeStart],
            +row[ColNameMovieServiceShowtimeTimeEnd],
            showtimeDayOfTheWeek,
            showtimeSlot
        )
    }
}

injected(ShowtimeDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SHOWTIME_DATA_ACCESSOR_TOKEN = token<ShowtimeDataAccessor>("ShowtimeDataAccessor");