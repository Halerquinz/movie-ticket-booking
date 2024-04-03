import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";

export interface UpdateScreenArguments {
    screenId: number;
    ofTheaterId: number;
    ofScreenTypeId: number;
}

export interface ScreenDataAccessor {
    createScreen(ofTheaterId: number, ofScreenTypeId: number): Promise<number>;
    updateScreen(args: UpdateScreenArguments): Promise<void>;
    deleteScreenType(id: number): Promise<void>;
    withTransaction<T>(cb: (dataAccessor: ScreenDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceScreenTab = "movie_service_screen_tab";
const ColNameMovieServiceScreenId = "screen_id";
const ColNameMovieServiceScreenOfTheaterId = "of_theater_id";
const ColNameMovieServiceScreenOfScreenTypeId = "of_screen_type_id";

export class ScreenDataAccessorImpl implements ScreenDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createScreen(ofTheaterId: number, ofScreenTypeId: number): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceScreenOfTheaterId]: ofTheaterId,
                    [ColNameMovieServiceScreenOfScreenTypeId]: ofScreenTypeId,
                })
                .returning(ColNameMovieServiceScreenId)
                .into(TabNameMovieServiceScreenTab);
            return +rows[0][ColNameMovieServiceScreenId];
        } catch (error) {
            this.logger.error("failed to create screen", { ofTheaterId, ofScreenTypeId, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateScreen(args: UpdateScreenArguments): Promise<void> {
        try {
            await this.knex
                .table(TabNameMovieServiceScreenTab)
                .update({
                    [ColNameMovieServiceScreenOfTheaterId]: args.ofTheaterId,
                    [ColNameMovieServiceScreenOfScreenTypeId]: args.ofScreenTypeId,
                })
                .where({
                    [ColNameMovieServiceScreenId]: args.screenId
                });
        } catch (error) {
            this.logger.error("failed to update screen", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteScreenType(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceScreenTab)
                .where({
                    [ColNameMovieServiceScreenId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete screen", { movieGenreId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no screen with id found", { id });
            throw new ErrorWithStatus(`no screen with id ${id} found`, status.NOT_FOUND);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: ScreenDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new ScreenDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(ScreenDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SCREEN_DATA_ACCESSOR_TOKEN = token<ScreenDataAccessor>("ScreenDataAccessor");