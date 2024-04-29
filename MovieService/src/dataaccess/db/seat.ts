import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Seat, SeatType } from "./models";

export interface CreateSeatArguments {
    ofScreenId: number,
    ofSeatTypeId: number,
    column: number,
    row: string,
    no: string,
}

export interface SeatDataAccessor {
    createSeat(args: CreateSeatArguments): Promise<number>;
    getSeat(id: number): Promise<Seat | null>;
    getSeatsOfScreen(screenId: number): Promise<Seat[]>;
    deleteSeat(id: number): Promise<void>;
    withTransaction<T>(cb: (dataAccessor: SeatDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceSeatTab = "movie_service_seat_tab";
const ColNameMovieServiceSeatId = "seat_id";
const ColNameMovieServiceSeatOfScreenId = "of_screen_id";
const ColNameMovieServiceSeatOfSeatTypeId = "of_seat_type_id";
const ColNameMovieServiceSeatColumn = "column";
const ColNameMovieServiceSeatRow = "row";
const ColNameMovieServiceSeatNo = "no";

const TabNameMovieServiceSeatTypeTab = "movie_service_seat_type_tab";
const ColNameMovieServiceSeatTypeId = "seat_type_id";
const ColNameMovieServiceSeatTypeDisplayName = "display_name";

export class SeatDataAccessorImpl implements SeatDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createSeat(args: CreateSeatArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceSeatOfScreenId]: args.ofScreenId,
                    [ColNameMovieServiceSeatOfSeatTypeId]: args.ofSeatTypeId,
                    [ColNameMovieServiceSeatColumn]: args.column,
                    [ColNameMovieServiceSeatRow]: args.row,
                    [ColNameMovieServiceSeatNo]: args.no,
                })
                .returning(ColNameMovieServiceSeatId)
                .into(TabNameMovieServiceSeatTab);
            return +rows[0][ColNameMovieServiceSeatId];
        } catch (error) {
            this.logger.error("failed to create seat", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getSeat(id: number): Promise<Seat | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceSeatTab)
                .leftOuterJoin(
                    TabNameMovieServiceSeatTypeTab,
                    `${TabNameMovieServiceSeatTab}.${ColNameMovieServiceSeatOfSeatTypeId}`,
                    `${TabNameMovieServiceSeatTypeTab}.${ColNameMovieServiceSeatTypeId}`
                )
                .where({
                    [ColNameMovieServiceSeatId]: id
                })
        } catch (error) {
            this.logger.error("failed to get seat", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no seat with id found", { id });
            return null;
        }

        return this.getSeatFromJoinedRow(rows[0]);
    }

    public async getSeatsOfScreen(screenId: number): Promise<Seat[]> {
        console.log(screenId);
        try {
            const rows = await this.knex
                .select()
                .from(TabNameMovieServiceSeatTab)
                .leftOuterJoin(
                    TabNameMovieServiceSeatTypeTab,
                    `${TabNameMovieServiceSeatTab}.${ColNameMovieServiceSeatOfSeatTypeId}`,
                    `${TabNameMovieServiceSeatTypeTab}.${ColNameMovieServiceSeatTypeId}`
                )
                .where(ColNameMovieServiceSeatOfScreenId, "=", screenId);

            return rows.map((row) => this.getSeatFromJoinedRow(row));
        } catch (error) {
            this.logger.error("failed to get seats of screen", { screenId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteSeat(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceSeatTab)
                .where({
                    [ColNameMovieServiceSeatId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete seat", { id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no seat with id found", { id });
            throw new ErrorWithStatus(`no seat with id ${id} found`, status.NOT_FOUND);
        }
    }

    private getSeatFromRow(row: Record<string, any>): Seat {
        let seatType: SeatType | null = null;
        if (row[ColNameMovieServiceSeatOfSeatTypeId]) {
            seatType = new SeatType(
                +row[ColNameMovieServiceSeatOfSeatTypeId], "");
        }

        return new Seat(
            +row[ColNameMovieServiceSeatId],
            seatType,
            +row[ColNameMovieServiceSeatOfScreenId],
            +row[ColNameMovieServiceSeatColumn],
            row[ColNameMovieServiceSeatRow],
            row[ColNameMovieServiceSeatNo]
        );
    }

    private getSeatFromJoinedRow(row: Record<string, any>): Seat {
        let seatType: SeatType | null = null;
        if (row[ColNameMovieServiceSeatOfSeatTypeId]) {
            seatType = new SeatType(
                +row[ColNameMovieServiceSeatOfSeatTypeId],
                row[ColNameMovieServiceSeatTypeDisplayName]
            );
        }

        return new Seat(
            +row[ColNameMovieServiceSeatId],
            seatType,
            +row[ColNameMovieServiceSeatOfScreenId],
            +row[ColNameMovieServiceSeatColumn],
            row[ColNameMovieServiceSeatRow],
            row[ColNameMovieServiceSeatNo]
        );
    }

    public async withTransaction<T>(cb: (dataAccessor: SeatDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new SeatDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(SeatDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SEAT_DATA_ACCESSOR_TOKEN = token<SeatDataAccessor>("SeatDataAccessor");