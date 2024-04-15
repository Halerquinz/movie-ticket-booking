import { injected, token } from "brandi";
import { Logger } from "winston";
import { PRICE_MANAGEMENT_OPERATOR_TOKEN, PriceManagementOperator } from "../module/price";
import { LOGGER_TOKEN } from "../utils";

export interface InsertDefaultPriceJob {
    execute(): Promise<void>;
}

export class InsertDefaultPriceJobImpl implements InsertDefaultPriceJob {
    constructor(
        private readonly priceManagementOperator: PriceManagementOperator,
        private readonly logger: Logger
    ) { }

    public async execute(): Promise<void> {
        await this.priceManagementOperator.insertDefaultPrice();
        this.logger.info("Insert all default price successfully");
    }
}

injected(InsertDefaultPriceJobImpl, PRICE_MANAGEMENT_OPERATOR_TOKEN, LOGGER_TOKEN);

export const INSERT_DEFAULT_PRICE_JOB_TOKEN = token<InsertDefaultPriceJob>(
    "DeleteExpiredBlacklistedTokenJob"
);