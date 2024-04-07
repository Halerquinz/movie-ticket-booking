import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { status } from "@grpc/grpc-js";
import { Screen } from "../db";

export interface UpdateScreenArguments {
    screenId: number;
    displayName: string;
}

export interface ScreenDataAccessor {
    createScreen(ofTheaterId: number, ofScreenTypeId: number, displayName: string): Promise<number>;
    updateScreen(args: UpdateScreenArguments): Promise<void>;
    deleteScreen(id: number): Promise<void>;
    getScreenByDisplayName(displayName: string): Promise<Screen | null>;
    getScreenByDisplayNameWithXLock(displayName: string): Promise<Screen | null>;
    getScreenById(id: number): Promise<Screen | null>;
    getScreenByIdWithXLock(id: number): Promise<Screen | null>;
    withTransaction<T>(cb: (dataAccessor: ScreenDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameMovieServiceScreenTab = "movie_service_screen_tab";
const ColNameMovieServiceScreenId = "screen_id";
const ColNameMovieServiceScreenOfTheaterId = "of_theater_id";
const ColNameMovieServiceScreenOfScreenTypeId = "of_screen_type_id";
const ColNameMovieServiceScreenDisplayName = "display_name";

export class ScreenDataAccessorImpl implements ScreenDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) { }

    public async createScreen(ofTheaterId: number, ofScreenTypeId: number, displayName: string): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameMovieServiceScreenOfTheaterId]: ofTheaterId,
                    [ColNameMovieServiceScreenOfScreenTypeId]: ofScreenTypeId,
                    [ColNameMovieServiceScreenDisplayName]: displayName
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
                    [ColNameMovieServiceScreenDisplayName]: args.displayName
                })
                .where({
                    [ColNameMovieServiceScreenId]: args.screenId
                });
        } catch (error) {
            this.logger.error("failed to update screen", { args, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteScreen(id: number): Promise<void> {
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

    public async getScreenById(id: number): Promise<Screen | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTab)
                .where({
                    [ColNameMovieServiceScreenId]: id
                });
        } catch (error) {
            this.logger.error("failed to get screen by id", { id })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one screen with id", status.INTERNAL);
        }

        return this.getScreenFromRow(rows[0]);
    }

    public async getScreenByIdWithXLock(id: number): Promise<Screen | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTab)
                .where({
                    [ColNameMovieServiceScreenId]: id
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get screen by id", { id })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen with id", { id });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen with id", { id });
            throw ErrorWithStatus.wrapWithStatus("more than one screen with id", status.INTERNAL);
        }

        return this.getScreenFromRow(rows[0]);
    }

    public async getScreenByDisplayName(displayName: string): Promise<Screen | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTab)
                .where({
                    [ColNameMovieServiceScreenDisplayName]: displayName
                });
        } catch (error) {
            this.logger.error("failed to get screen by displayName", { displayName })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen with displayName", { displayName });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen with displayName", { displayName });
            throw ErrorWithStatus.wrapWithStatus("more than one screen with displayName", status.INTERNAL);
        }

        return this.getScreenFromRow(rows[0]);
    }

    public async getScreenByDisplayNameWithXLock(displayName: string): Promise<Screen | null> {
        let rows: Record<string, any>;
        try {
            rows = await this.knex
                .select()
                .from(TabNameMovieServiceScreenTab)
                .where({
                    [ColNameMovieServiceScreenDisplayName]: displayName
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get screen by displayName", { displayName })
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.error("cannot found screen with displayName", { displayName });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one screen with displayName", { displayName });
            throw ErrorWithStatus.wrapWithStatus("more than one screen with displayName", status.INTERNAL);
        }

        return this.getScreenFromRow(rows[0]);
    }

    public async withTransaction<T>(cb: (dataAccessor: ScreenDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new ScreenDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getScreenFromRow(row: Record<string, any>): Screen {
        return new Screen(
            +row[ColNameMovieServiceScreenId],
            +row[ColNameMovieServiceScreenOfTheaterId],
            +row[ColNameMovieServiceScreenOfScreenTypeId],
            row[ColNameMovieServiceScreenDisplayName]
        );
    }
}

injected(ScreenDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const SCREEN_DATA_ACCESSOR_TOKEN = token<ScreenDataAccessor>("ScreenDataAccessor");