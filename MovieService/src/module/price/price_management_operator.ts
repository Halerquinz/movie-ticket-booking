import { injected, token } from "brandi";
import { Logger } from "winston";
import { PRICE_DATA_ACCESSOR_TOKEN, PriceDataAccessor } from "../../dataaccess/db";
import { LOGGER_TOKEN } from "../../utils";

export interface PriceManagementOperator {
    insertDefaultPrice(): Promise<void>
}


export class PriceImageManagementOperatorImpl implements PriceManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly priceDM: PriceDataAccessor,
    ) { }

    public async insertDefaultPrice(): Promise<void> {
        return await this.priceDM.insertDefaultPrice();
    }
}

injected(
    PriceImageManagementOperatorImpl,
    LOGGER_TOKEN,
    PRICE_DATA_ACCESSOR_TOKEN
);

export const PRICE_MANAGEMENT_OPERATOR_TOKEN = token<PriceManagementOperator>("PriceImageManagementOperator");
