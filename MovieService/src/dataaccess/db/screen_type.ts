import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { ScreenType } from "./models";

export interface CreateScreenTypeArguments {
    displayName: string;
    description: string;
    seatCount: number;
    rowCount: number,
    seatOfRowCount: number
}

export interface UpdateScreenTypeArguments {
    screenTypeId: number;
    displayName: string;
    description: string;
}

export interface ScreenTypeDataAccessor {
    createScreenType(args: CreateScreenTypeArguments): Promise<number>;
    updateScreenType(args: UpdateScreenTypeArguments): Promise<void>;
    deleteScreenType(id: number): Promise<void>;
    getScreenTypeByDisplayName(displayName: string): Promise<ScreenType | null>;
    getScreenTypeByDisplayNameWithXLock(displayName: string): Promise<ScreenType | null>;
    getScreenTypeById(id: number): Promise<ScreenType | null>;
    getScreenTypeByIdWithXLock(id: number): Promise<ScreenType | null>;
    withTransaction<T>(cb: (dataAccessor: ScreenTypeDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceScreenTypeTab = "movie_service_screen_type_tab";
const ColNameMovieServiceScreenTypeId = "screen_type_id";
const ColNameMovieServiceScreenTypeDisplayName = "display_name";
const ColNameMovieServiceScreenTypeDescription = "description";
const ColNameMovieServiceScreenTypeSeatCount = "seat_count";
const ColNameMovieServiceScreenTypeRowCount = "row_count";
const ColNameMovieServiceScreenTypeSeatOfRowCount = "seat_of_row_count";

export class ScreenTypeDataAccessorImpl implements ScreenTypeDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createScreenType(args: CreateScreenTypeArguments): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceScreenTypeDisplayName]: args.displayName,
                    [ColNameMovieServiceScreenTypeDescription]: args.description,
                    [ColNameMovieServiceScreenTypeSeatCount]: args.seatCount,
                    [ColNameMovieServiceScreenTypeRowCount]: args.rowCount,
                    [ColNameMovieServiceScreenTypeSeatOfRowCount]: args.seatOfRowCount
                })
                .returning(ColNameMovieServiceScreenTypeId)
                .into(TabNameMovieServiceScreenTypeTab);
            return +rows[0][ColNameMovieServiceScreenTypeId];
        } catch (error) {
            this.logger.error("failed to create screen type", {
                screenType: {
                    name: args.displayName,
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
                    [ColNameMovieServiceScreenTypeDisplayName]: args.displayName,
                    [ColNameMovieServiceScreenTypeDescription]: args.description,
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

    public async getScreenTypeById(id: number): Promise<ScreenType | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTypeTab)
                .where({
                    [ColNameMovieServiceScreenTypeId]: id
                });
        } catch (error) {
            this.logger.error("failed to get screen type by id", { id })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen type with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen type with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one screen type with id", status.INTERNAL);
        }

        return this.getScreenTypeFromRow(rows[0]);
    }

    public async getScreenTypeByIdWithXLock(id: number): Promise<ScreenType | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTypeTab)
                .where({
                    [ColNameMovieServiceScreenTypeId]: id
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get screen type by id", { id })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen type with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen type with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one screen type with id", status.INTERNAL);
        }

        return this.getScreenTypeFromRow(rows[0]);
    }

    public async getScreenTypeByDisplayName(displayName: string): Promise<ScreenType | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTypeTab)
                .where({
                    [ColNameMovieServiceScreenTypeDisplayName]: displayName
                });
        } catch (error) {
            this.logger.error("failed to get screen type by name", { name: displayName })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen type with name", { name: displayName });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen type with name", { name: displayName });
            throw ErrorWithStatus.wrapWithStatus("more than one screen type with name", status.INTERNAL);
        }

        return this.getScreenTypeFromRow(rows[0]);
    }

    public async getScreenTypeByDisplayNameWithXLock(displayName: string): Promise<ScreenType | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTypeTab)
                .where({
                    [ColNameMovieServiceScreenTypeDisplayName]: displayName
                });
        } catch (error) {
            this.logger.error("failed to get screen type by name", { name: displayName })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen type with name", { name: displayName });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen type with name", { name: displayName });
            throw ErrorWithStatus.wrapWithStatus("more than one screen type with name", status.INTERNAL);
        }

        return this.getScreenTypeFromRow(rows[0]);
    }

    public async withTransaction<T>(cb: (dataAccessor: ScreenTypeDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new ScreenTypeDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getScreenTypeFromRow(row: Record<string, any>): ScreenType {
        return new ScreenType(
            +row[ColNameMovieServiceScreenTypeId],
            row[ColNameMovieServiceScreenTypeDisplayName],
            row[ColNameMovieServiceScreenTypeDescription],
            +row[ColNameMovieServiceScreenTypeSeatCount],
            +row[ColNameMovieServiceScreenTypeRowCount],
            +row[ColNameMovieServiceScreenTypeSeatOfRowCount]
        );
    }
}

injected(ScreenTypeDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SCREEN_TYPE_DATA_ACCESSOR_TOKEN = token<ScreenTypeDataAccessor>("ScreenTypeDataAccessor");