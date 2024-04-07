import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Seat } from "./models";

export interface CreateSeatArguments {
    ofScreenId: number,
    column: number,
    row: string,
    no: string,
}

export interface SeatDataAccessor {
    createSeat(args: CreateSeatArguments): Promise<number>;
    getSeat(id: number): Promise<Seat | null>;
    deleteSeat(id: number): Promise<void>;
    withTransaction<T>(cb: (dataAccessor: SeatDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceSeatTab = "movie_service_seat_tab";
const ColNameMovieServiceSeatId = "seat_id";
const ColNameMovieServiceSeatOfScreenId = "of_screen_id";
const ColNameMovieServiceSeatColumn = "column";
const ColNameMovieServiceSeatRow = "row";
const ColNameMovieServiceSeatNo = "no";

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

        return rows[0];
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

    public async withTransaction<T>(cb: (dataAccessor: SeatDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new SeatDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(SeatDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SEAT_DATA_ACCESSOR_TOKEN = token<SeatDataAccessor>("SeatDataAccessor");