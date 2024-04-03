import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";

export interface CreateScreenTypeArguments {
    name: string;
    description: string;
    seatCount: number;
}

export interface UpdateScreenTypeArguments {
    screenTypeId: number;
    name: string;
    description: string;
    seatCount: number;
}

export interface ScreenTypeDataAccessor {
    createScreenType(args: CreateScreenTypeArguments): Promise<number>;
    updateScreenType(args: UpdateScreenTypeArguments): Promise<void>;
    deleteScreenType(id: number): Promise<void>;
    withTransaction<T>(cb: (dataAccessor: ScreenTypeDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceScreenTypeTab = "movie_service_screen_type_tab";
const ColNameMovieServiceScreenTypeId = "screen_type_id";
const ColNameMovieServiceScreenTypeName = "name";
const ColNameMovieServiceScreenTypeDescription = "description";
const ColNameMovieServiceScreenTypeSeatCount = "seat_count";

export class ScreenTypeDataAccessorImpl implements ScreenTypeDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createScreenType(args: CreateScreenTypeArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceScreenTypeName]: args.name,
                    [ColNameMovieServiceScreenTypeDescription]: args.description,
                    [ColNameMovieServiceScreenTypeSeatCount]: args.seatCount
                })
                .returning(ColNameMovieServiceScreenTypeId)
                .into(TabNameMovieServiceScreenTypeTab);
            return +rows[0][ColNameMovieServiceScreenTypeId];
        } catch (error) {
            this.logger.error("failed to create screen type", {
                screenType: {
                    name: args.name,
                    description: args.description,
                    seatCount: args.seatCount
                },
                error
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateScreenType(args: UpdateScreenTypeArguments): Promise<void> {
        try {
            await this.knex
                .table(TabNameMovieServiceScreenTypeTab)
                .update({
                    [ColNameMovieServiceScreenTypeName]: args.name,
                    [ColNameMovieServiceScreenTypeDescription]: args.description,
                    [ColNameMovieServiceScreenTypeSeatCount]: args.seatCount,

                })
                .where({
                    [ColNameMovieServiceScreenTypeId]: args.screenTypeId
                });
        } catch (error) {
            this.logger.error("failed to update screen type", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteScreenType(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameMovieServiceScreenTypeTab)
                .where({
                    [ColNameMovieServiceScreenTypeId]: id
                });
        } catch (error) {
            this.logger.error("failed to delete screen type", { movieGenreId: id, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no screen type  with id found", { userRoleId: id, });
            throw new ErrorWithStatus(`no screen type with id ${id} found`, status.NOT_FOUND);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: ScreenTypeDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new ScreenTypeDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }
}

injected(ScreenTypeDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SCREEN_TYPE_DATA_ACCESSOR_TOKEN = token<ScreenTypeDataAccessor>("ScreenTypeDataAccessor");