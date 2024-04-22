import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN, MovieTypeHasScreenTypeDataAccessor } from "../../dataaccess/db";
import { LOGGER_TOKEN } from "../../utils";

export interface MovieTypeHasScreenTypeManagementOperator {
    insertMovieTypeHasScreenType(): Promise<void>;
}

export class MovieTypeHasScreenTypeManagementOperatorImpl implements MovieTypeHasScreenTypeManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly movieTypeHasScreenTypeDM: MovieTypeHasScreenTypeDataAccessor,
    ) { }

    public async insertMovieTypeHasScreenType(): Promise<void> {
        return await this.movieTypeHasScreenTypeDM.insertMovieTypeHasScreenType();
    }
}

injected(
    MovieTypeHasScreenTypeManagementOperatorImpl,
    LOGGER_TOKEN,
    MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN
);

export const MOVIE_TYPE_HAS_SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN =
    token<MovieTypeHasScreenTypeManagementOperator>("MovieTypeHasScreenTypeManagementOperator");
