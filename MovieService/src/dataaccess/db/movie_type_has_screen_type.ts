import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export class MovieTypeHasScreenType {
    constructor(
        public movieTypeId: number,
        public screenTypeId: number
    ) { }
}

export interface MovieTypeHasScreenTypeDataAccessor {
    insertMovieTypeHasScreenType(): Promise<void>;
    getMovieTypeHasScreenTypeCount(): Promise<number>;
    getMovieTypeHasScreenType(movieTypeId: number, screenTypeId: number): Promise<MovieTypeHasScreenType | null>;
    withTransaction<T>(cb: (dataAccessor: MovieTypeHasScreenTypeDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceMovieTypeHasScreenTypeTab = "movie_service_movie_type_has_screen_type_tab";
const ColNameMovieServiceMovieTypeHasScreenTypeMovieTypeId = "movie_type_id";
const ColNameMovieServiceMovieTypeHasScreenTypeScreenTypeId = "screen_type_id";

export class MovieTypeHasScreenTypeDataAccessorImpl implements MovieTypeHasScreenTypeDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async insertMovieTypeHasScreenType(): Promise<void> {
        try {
            await this.knex(TabNameMovieServiceMovieTypeHasScreenTypeTab).insert([
                // 2D movie types linked with 2D screen types
                { movie_type_id: 1, screen_type_id: 1 },  // 2D Subtitle with 2D Small
                { movie_type_id: 1, screen_type_id: 2 },  // 2D Subtitle with 2D Medium
                { movie_type_id: 1, screen_type_id: 3 },  // 2D Subtitle with 2D Large
                { movie_type_id: 2, screen_type_id: 1 },  // 2D Dubbing with 2D Small
                { movie_type_id: 2, screen_type_id: 2 },  // 2D Dubbing with 2D Medium
                { movie_type_id: 2, screen_type_id: 3 },  // 2D Dubbing with 2D Large
                // 3D movie types linked with 3D screen types
                { movie_type_id: 3, screen_type_id: 4 },  // 3D Subtitle with 3D Small
                { movie_type_id: 3, screen_type_id: 5 },  // 3D Subtitle with 3D Medium
                { movie_type_id: 3, screen_type_id: 6 },  // 3D Subtitle with 3D Large
                { movie_type_id: 4, screen_type_id: 4 },  // 3D Dubbing with 3D Small
                { movie_type_id: 4, screen_type_id: 5 },  // 3D Dubbing with 3D Medium
                { movie_type_id: 4, screen_type_id: 6 }   // 3D Dubbing with 3D Large
            ])
        } catch (error) {
            this.logger.error("failed to insert movie type has screen type", error);
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getMovieTypeHasScreenTypeCount(): Promise<number> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .count()
                .from(TabNameMovieServiceMovieTypeHasScreenTypeTab);
        } catch (error) {
            this.logger.error("get price count fail", {
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        return +rows[0]["count"];
    }

    public async getMovieTypeHasScreenType(movieTypeId: number, screenTypeId: number): Promise<MovieTypeHasScreenType | null> {
        let rows;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceMovieTypeHasScreenTypeTab)
                .where(ColNameMovieServiceMovieTypeHasScreenTypeMovieTypeId, "=", movieTypeId)
                .andWhere(ColNameMovieServiceMovieTypeHasScreenTypeScreenTypeId, "=", screenTypeId);
        } catch (error) {
            this.logger.error("failed to get movie type has screen type", { movieTypeId, screenTypeId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no movie type has screen type found", { movieTypeId, screenTypeId, });
            return null;
        }

        return this.getMovieTypeHasScreenTypeFromRow(rows[0]);
    }

    public async withTransaction<T>(cb: (dataAccessor: MovieTypeHasScreenTypeDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new MovieTypeHasScreenTypeDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getMovieTypeHasScreenTypeFromRow(row: Record<string, any>): MovieTypeHasScreenType {
        return new MovieTypeHasScreenType(
            +row[ColNameMovieServiceMovieTypeHasScreenTypeMovieTypeId],
            +row[ColNameMovieServiceMovieTypeHasScreenTypeScreenTypeId]
        )
    }
}

injected(MovieTypeHasScreenTypeDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const MOVIE_TYPE_HAS_SCREEN_TYPE_DATA_ACCESSOR_TOKEN = token<MovieTypeHasScreenTypeDataAccessor>("MovieTypeHasScreenTypeDataAccessor");