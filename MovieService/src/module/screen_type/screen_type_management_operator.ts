import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import { SCREEN_TYPE_DATA_ACCESSOR_TOKEN, ScreenType, ScreenTypeDataAccessor } from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { filterXSS } from "xss";

export interface ScreenTypeManagementOperator {
    createScreenType(
        displayName: string,
        description: string,
        seatCount: number,
        rowCount: number,
        seatOfRowCount: number
    ): Promise<ScreenType>;
    updateScreenType(
        screenTypeId: number,
        displayName: string,
        description: string,
    ): Promise<ScreenType>;
    deleteScreenType(id: number): Promise<void>;
}

export class ScreenTypeManagementOperatorImpl implements ScreenTypeManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly screenTypeDM: ScreenTypeDataAccessor,
    ) { }

    public async createScreenType(
        displayName: string,
        description: string,
        seatCount: number,
        rowCount: number,
        seatOfRowCount: number
    ): Promise<ScreenType> {
        displayName = this.sanitizeDisplayName(displayName);
        if (!this.isValidDisplayName(displayName)) {
            this.logger.error("invalid display name", { displayName });
            throw new ErrorWithStatus(
                `invalid display name ${displayName}`,
                status.INVALID_ARGUMENT
            );
        }

        description = this.sanitizeDescription(description);

        return this.screenTypeDM.withTransaction<ScreenType>(async (screenTypeDM) => {
            const screenTypeRecord = await screenTypeDM.getScreenTypeByDisplayNameWithXLock(displayName);
            if (screenTypeRecord !== null) {
                this.logger.error("displayName has already been taken", {
                    displayName
                });
                throw new ErrorWithStatus(`displayName ${displayName} has already been taken`, status.ALREADY_EXISTS);
            }

            const createdScreenTypeId = await screenTypeDM.createScreenType({
                displayName: displayName,
                description,
                seatCount,
                rowCount,
                seatOfRowCount
            });

            return {
                screenTypeId: createdScreenTypeId,
                description: description,
                displayName: displayName,
                seatCount: seatCount,
                rowCount: rowCount,
                seatOfRowCount: seatOfRowCount
            }
        })
    }

    public async updateScreenType(
        screenTypeId: number,
        displayName: string,
        description: string,
    ): Promise<ScreenType> {
        displayName = this.sanitizeDisplayName(displayName);
        description = this.sanitizeDescription(description);

        return this.screenTypeDM.withTransaction<ScreenType>(async (screenTypeDM) => {
            const screenTypeRecord = await screenTypeDM.getScreenTypeByIdWithXLock(screenTypeId);
            if (screenTypeRecord === null) {
                this.logger.error("can not find screen type with id");
                throw new ErrorWithStatus(`can not find screen type with id`, status.INVALID_ARGUMENT);
            }

            if (displayName !== undefined) {
                const screenTypeWithNameRecord = await screenTypeDM.getScreenTypeByDisplayNameWithXLock(displayName);
                if (screenTypeWithNameRecord !== null && screenTypeWithNameRecord.displayName !== displayName) {
                    this.logger.error("displayName already exist");
                    throw new ErrorWithStatus(`displayName already exist`, status.ALREADY_EXISTS);
                }

                screenTypeRecord.displayName = displayName;
            }

            await screenTypeDM.updateScreenType({
                screenTypeId: screenTypeId,
                displayName: displayName,
                description: description,
            })

            if (description !== undefined) {
                screenTypeRecord.description = description;
            }

            return screenTypeRecord;
        })
    }

    public async deleteScreenType(id: number): Promise<void> {
        return this.screenTypeDM.deleteScreenType(id);
    }

    private sanitizeDescription(description: string): string {
        return filterXSS(validator.trim(description));
    }

    private sanitizeDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }

    private isValidDisplayName(displayName: string): boolean {
        return validator.isLength(displayName, { min: 1, max: 256 });
    }
}

injected(ScreenTypeManagementOperatorImpl, LOGGER_TOKEN, SCREEN_TYPE_DATA_ACCESSOR_TOKEN);

export const SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN = token<ScreenTypeManagementOperator>("ScreenTypeManagementOperator");