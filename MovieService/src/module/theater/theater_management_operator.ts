import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import { THEATER_DATA_ACCESSOR_TOKEN, Theater, TheaterDataAccessor } from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface TheaterManagementOperator {
    createTheater(displayName: string, location: string): Promise<Theater>;
    updateTheater(id: number, displayName: string, location: string): Promise<Theater>;
    getTheater(id: number): Promise<Theater>;
    deleteTheater(id: number): Promise<void>;
}

export class TheaterManagementOperatorImpl implements TheaterManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly theaterDM: TheaterDataAccessor,
    ) { }

    public async createTheater(displayName: string, location: string): Promise<Theater> {
        displayName = this.sanitizeName(displayName);
        location = this.sanitizeLocation(location);

        const createdTheaterId = await this.theaterDM.createTheater({ displayName, location });
        return {
            id: createdTheaterId,
            displayName: displayName,
            location: location,
            screenCount: 0,
            seatCount: 0
        };
    }

    public async updateTheater(id: number, displayName: string, location: string): Promise<Theater> {
        displayName = this.sanitizeName(displayName);
        location = this.sanitizeLocation(location);

        return this.theaterDM.withTransaction(async (theaterDM) => {
            const theaterRecord = await theaterDM.getTheaterByIdWithXLock(id);
            if (theaterRecord === null) {
                this.logger.error("no theater with id found", {
                    id
                });
                throw new ErrorWithStatus(`no theater with id${id}`, status.ALREADY_EXISTS);
            }

            await theaterDM.updateTheater({ theaterId: id, displayName: displayName, location: location });
            theaterRecord.displayName = displayName;
            theaterRecord.location = location;

            return theaterRecord;
        });
    }

    public async getTheater(id: number): Promise<Theater> {
        const theater = await this.theaterDM.getTheaterById(id);
        if (theater === null) {
            this.logger.error("no theater with theater_id found", { theaterId: id });
            throw new ErrorWithStatus(`no theater with theater_id ${id} found`, status.NOT_FOUND);
        }

        return theater;
    }

    public async deleteTheater(id: number): Promise<void> {
        return this.theaterDM.deleteTheater(id);
    }

    private sanitizeName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }

    private sanitizeLocation(location: string): string {
        return validator.escape(validator.trim(location));
    }
}

injected(TheaterManagementOperatorImpl, LOGGER_TOKEN, THEATER_DATA_ACCESSOR_TOKEN);

export const THEATER_MANAGEMENT_OPERATOR_TOKEN = token<TheaterManagementOperator>("TheaterManagementOperator");