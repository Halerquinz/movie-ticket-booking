import { injected, token } from "brandi";
import { Logger } from "winston";
import {
    MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN,
    MovieTypeHasScreenTypeDataAccessor,
    PRICE_DATA_ACCESSOR_TOKEN,
    PriceDataAccessor
} from "../dataaccess/db";
import { MOVIE_TYPE_HAS_SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, MovieTypeHasScreenTypeManagementOperator } from "../module/movie_type_has_screen_type";
import { PRICE_MANAGEMENT_OPERATOR_TOKEN, PriceManagementOperator } from "../module/price";
import { LOGGER_TOKEN } from "../utils";

export interface InitializationJob {
    execute(): Promise<void>;
}

export class InitializationJobImpl implements InitializationJob {
    constructor(
        private readonly priceManagementOperator: PriceManagementOperator,
        private readonly movieTypeHasScreenTypeManagementOperator: MovieTypeHasScreenTypeManagementOperator,
        private readonly priceDM: PriceDataAccessor,
        private readonly movieTypeHasScreenTypeDM: MovieTypeHasScreenTypeDataAccessor,
        private readonly logger: Logger
    ) { }

    public async execute(): Promise<void> {
        const count = await Promise.all([
            this.priceDM.getPriceCount(),
            this.movieTypeHasScreenTypeDM.getMovieTypeHasScreenTypeCount()
        ]);
        if (count[0] > 0 || count[1] > 0) {
            this.logger.info("will skip initialization");
            return;
        }

        await Promise.all([
            this.priceManagementOperator.insertDefaultPrice(),
            this.movieTypeHasScreenTypeManagementOperator.insertMovieTypeHasScreenType()
        ]);

        this.logger.info("initialization finish");
    }
}

injected(
    InitializationJobImpl,
    PRICE_MANAGEMENT_OPERATOR_TOKEN,
    MOVIE_TYPE_HAS_SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN,
    PRICE_DATA_ACCESSOR_TOKEN,
    MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN
);

export const INITIALIZATION_JOB_TOKEN = token<InitializationJob>("InitializationJob");