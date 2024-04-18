import { injected, token } from "brandi";
import { Logger } from "winston";
import { PRICE_DATA_ACCESSOR_TOKEN, Price, PriceDataAccessor } from "../../dataaccess/db";
import { LOGGER_TOKEN } from "../../utils";

export interface PriceManagementOperator {
    insertDefaultPrice(): Promise<void>;
    getPrice(
        ofMovieTypeId: number,
        ofSeatTypeId: number,
        ofShowtimeSlotId: number,
        ofShowtimeDayOfTheWeekId: number,
    ): Promise<Price | null>
}

export class PriceImageManagementOperatorImpl implements PriceManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly priceDM: PriceDataAccessor,
    ) { }

    public async insertDefaultPrice(): Promise<void> {
        return await this.priceDM.insertDefaultPrice();
    }

    public async getPrice(
        ofMovieTypeId: number,
        ofSeatTypeId: number,
        ofShowtimeSlotId: number,
        ofShowtimeDayOfTheWeekId: number
    ): Promise<Price | null> {
        return this.priceDM.getPrice(ofMovieTypeId, ofSeatTypeId, ofShowtimeSlotId, ofShowtimeDayOfTheWeekId);
    }
}

injected(
    PriceImageManagementOperatorImpl,
    LOGGER_TOKEN,
    PRICE_DATA_ACCESSOR_TOKEN
);

export const PRICE_MANAGEMENT_OPERATOR_TOKEN = token<PriceManagementOperator>("PriceImageManagementOperator");
