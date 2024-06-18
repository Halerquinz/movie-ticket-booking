import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Price } from "./models";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../config";

export interface PriceDataAccessor {
    insertDefaultPrice(): Promise<void>;
    getPrice(
        ofMovieTypeId: number,
        ofSeatTypeId: number,
        ofShowtimeSlotId: number,
        ofShowtimeDayOfTheWeekId: number,
    ): Promise<Price | null>;
    getPriceCount(): Promise<number>;
    withTransaction<T>(cb: (dataAccessor: PriceDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServicePrice = "movie_service_price_tab";
const ColNameMovieServicePriceId = "price_id";
const ColNameMovieServicePriceOfMovieTypeId = "of_movie_type_id";
const ColNameMovieServicePriceOfSeatTypeId = "of_seat_type_id";
const ColNameMovieServicePriceOfShowtimeSlotId = "of_showtime_slot_id";
const ColNameMovieServicePriceOfShowtimeDayOfTheWeekId = "of_showtime_day_of_the_week_id";
const ColNameMovieServicePrice = "price";
const ColNameMovieServicePriceCurrency = "currency";

export class PriceDataAccessorImpl implements PriceDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger,
        private readonly applicationConfig: ApplicationConfig
    ) { }

    public async getPrice(
        ofMovieTypeId: number,
        ofSeatTypeId: number,
        ofShowtimeSlotId: number,
        ofShowtimeDayOfTheWeekId: number
    ): Promise<Price | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServicePrice)
                .where(ColNameMovieServicePriceOfMovieTypeId, "=", ofMovieTypeId)
                .andWhere(ColNameMovieServicePriceOfSeatTypeId, "=", ofSeatTypeId)
                .andWhere(ColNameMovieServicePriceOfShowtimeSlotId, "=", ofShowtimeSlotId)
                .andWhere(ColNameMovieServicePriceOfShowtimeDayOfTheWeekId, "=", ofShowtimeDayOfTheWeekId);
        } catch (error) {
            this.logger.error("failed to get price", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no price with found");
            return null;
        }

        const row = rows[0];
        return new Price(
            +row[ColNameMovieServicePriceId],
            +row[ColNameMovieServicePriceOfMovieTypeId],
            +row[ColNameMovieServicePriceOfSeatTypeId],
            +row[ColNameMovieServicePriceOfShowtimeDayOfTheWeekId],
            +row[ColNameMovieServicePriceOfShowtimeSlotId],
            (+row[ColNameMovieServicePrice]) / this.applicationConfig.multiplier,
            row[ColNameMovieServicePriceCurrency]
        );
    }

    public async getPriceCount(): Promise<number> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .count()
                .from(TabNameMovieServicePrice);
        } catch (error) {
            this.logger.error("get price count failed", {
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        return +rows[0]["count"];
    }

    public async insertDefaultPrice(): Promise<void> {
        try {
            await this.knex(TabNameMovieServicePrice).insert([
                // 2D Subtitle Normal T2-T5 Before 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 100000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Subtitle Normal T2-T5 After 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 100000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Subtitle Normal T6-CN Before 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 120000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Subtitle Normal T6-CN After 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 120000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },

                // 2D Subtitle Vip T2-T5 Before 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 110000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Subtitle Vip T2-T5 After 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 110000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Subtitle Vip T6-CN Before 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 130000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Subtitle Vip T6-CN After 5pm
                {
                    of_movie_type_id: 1,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 130000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },


                // 2D Dubbing Normal T2-T5 Before 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 100000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Dubbing Normal T2-T5 After 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 100000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Dubbing Normal T6-CN Before 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 120000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Dubbing Normal T6-CN After 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 120000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },

                // 2D Dubbing Vip T2-T5 Before 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 110000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Dubbing Vip T2-T5 After 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 110000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Dubbing Vip T6-CN Before 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 130000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 2D Dubbing Vip T6-CN After 5pm
                {
                    of_movie_type_id: 2,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 130000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },

                // 3D Subtitle Normal T2-T5 Before 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 150000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Subtitle Normal T2-T5 After 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 150000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Subtitle Normal T6-CN Before 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 170000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Subtitle Normal T6-CN After 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 170000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },

                // 3D Subtitle Vip T2-T5 Before 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 160000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Subtitle Vip T2-T5 After 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 160000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Subtitle Vip T6-CN Before 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 180000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Subtitle Vip T6-CN After 5pm
                {
                    of_movie_type_id: 3,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 180000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },

                // 3D Dubbing Normal T2-T5 Before 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 150000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Dubbing Normal T2-T5 After 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 150000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Dubbing Normal T6-CN Before 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 170000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Dubbing Normal T6-CN After 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 1,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 170000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },

                // 3D Dubbing Vip T2-T5 Before 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 1,
                    price: 160000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Dubbing Vip T2-T5 After 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 1,
                    price: 160000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Dubbing Vip T6-CN Before 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 1,
                    of_showtime_day_of_the_week_id: 2,
                    price: 180000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
                // 3D Dubbing Vip T6-CN After 5pm
                {
                    of_movie_type_id: 4,
                    of_seat_type_id: 2,
                    of_showtime_slot_id: 2,
                    of_showtime_day_of_the_week_id: 2,
                    price: 180000 * this.applicationConfig.multiplier,
                    currency: "VND"
                },
            ]);
        } catch (error) {
            this.logger.error("failed to insert all default price", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: PriceDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new PriceDataAccessorImpl(tx, this.logger, this.applicationConfig);
            return cb(txDataAccessor);
        });
    }
}

injected(PriceDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN, APPLICATION_CONFIG_TOKEN);

export const PRICE_DATA_ACCESSOR_TOKEN = token<PriceDataAccessor>("PriceDataAccessor");