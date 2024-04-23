import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Logger } from "winston";
import {
    MOVIE_DATA_ACCESSOR_TOKEN,
    MovieDataAccessor,
    PRICE_DATA_ACCESSOR_TOKEN,
    Price,
    PriceDataAccessor,
    SEAT_DATA_ACCESSOR_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    SeatDataAccessor,
    ShowtimeDataAccessor
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface PriceManagementOperator {
    insertDefaultPrice(): Promise<void>;
    getPrice(showtimeId: number, seatId: number): Promise<Price | null>;
}

export class PriceManagementOperatorImpl implements PriceManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly priceDM: PriceDataAccessor,
        private readonly showtimeDM: ShowtimeDataAccessor,
        private readonly seatDM: SeatDataAccessor,
        private readonly movieDM: MovieDataAccessor,
    ) { }

    public async insertDefaultPrice(): Promise<void> {
        return await this.priceDM.insertDefaultPrice();
    }

    public async getPrice(showTimeId: number, seatId: number): Promise<Price | null> {
        const showtime = await this.showtimeDM.getShowtime(showTimeId);
        if (showtime === null) {
            this.logger.error("no showtime with showtime_id found", { showTimeId });
            throw new ErrorWithStatus(`no showtime with showtime_id ${showTimeId} found`, status.NOT_FOUND);
        }

        const movie = await this.movieDM.getMovieById(showtime.ofMovieId);
        if (movie === null) {
            this.logger.error("no movie with showtime_id found", { showTimeId });
            throw new ErrorWithStatus(`no movie with showtime_id ${showTimeId} found`, status.NOT_FOUND);
        }

        const seat = await this.seatDM.getSeat(seatId);
        if (seat === null) {
            this.logger.error("no seat with seat_id found", { seatId });
            throw new ErrorWithStatus(`no seat with seat_id ${seatId} found`, status.NOT_FOUND);
        }

        return this.priceDM.getPrice(
            movie.movieType?.id!,
            seat.seatType?.id!,
            showtime.showtimeSlot?.id!,
            showtime.showtimeDayOfTheWeek?.id!
        );
    }
}

injected(
    PriceManagementOperatorImpl,
    LOGGER_TOKEN,
    PRICE_DATA_ACCESSOR_TOKEN,
    SHOWTIME_DATA_ACCESSOR_TOKEN,
    SEAT_DATA_ACCESSOR_TOKEN,
    MOVIE_DATA_ACCESSOR_TOKEN
);

export const PRICE_MANAGEMENT_OPERATOR_TOKEN = token<PriceManagementOperator>("PriceManagementOperator");
