import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import { SCREEN_DATA_ACCESSOR_TOKEN, SCREEN_TYPE_DATA_ACCESSOR_TOKEN, Screen, ScreenDataAccessor, ScreenTypeDataAccessor } from "../../dataaccess/db";
import { SCREEN_CREATED_PRODUCER_TOKEN, ScreenCreated, ScreenCreatedProducer } from "../../dataaccess/kafka";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface ScreenManagementOperator {
    createScreen(
        theaterId: number,
        screenTypeId: number,
        displayName: string,
    ): Promise<Screen>;
    updateScreen(
        screenId: number,
        displayName: string,
    ): Promise<Screen>;
    deleteScreen(id: number): Promise<void>;
}

export class ScreenManagementOperatorImpl implements ScreenManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly screenDM: ScreenDataAccessor,
        private readonly screenTypeDM: ScreenTypeDataAccessor,
        private readonly screenCreatedProducer: ScreenCreatedProducer,
    ) { }

    public async createScreen(theaterId: number, screenTypeId: number, displayName: string): Promise<Screen> {
        const screenType = await this.screenTypeDM.getScreenTypeById(screenTypeId);
        if (screenType === null) {
            this.logger.error("no screen type with screen_type_id", { screenTypeId });
            throw new ErrorWithStatus(`no screen type with screen_type_id ${screenTypeId} found`, status.NOT_FOUND);
        }

        displayName = this.sanitizeDisplayName(displayName);
        if (!this.isValidDisplayName(displayName)) {
            this.logger.error("invalid display name", { displayName });
            throw new ErrorWithStatus(
                `invalid display name ${displayName}`,
                status.INVALID_ARGUMENT
            );
        }

        return this.screenDM.withTransaction<Screen>(async (screenDM) => {
            const createdScreenId = await screenDM.createScreen(
                theaterId,
                screenTypeId,
                displayName
            )

            await this.screenCreatedProducer.createScreenCreatedMessage(new ScreenCreated(createdScreenId, screenTypeId));

            return {
                id: createdScreenId,
                ofTheaterId: theaterId,
                ofScreenTypeId: screenTypeId,
                displayName: displayName
            }
        })
    }

    public async updateScreen(screenId: number, displayName: string): Promise<Screen> {
        displayName = this.sanitizeDisplayName(displayName);
        if (!this.isValidDisplayName(displayName)) {
            this.logger.error("invalid display name", { displayName });
            throw new ErrorWithStatus(
                `invalid display name ${displayName}`,
                status.INVALID_ARGUMENT
            );
        }

        return this.screenDM.withTransaction<Screen>(async (screenDM) => {
            const screenRecord = await screenDM.getScreenByIdWithXLock(screenId);
            if (screenRecord === null) {
                this.logger.error("can not find screen with screen_id", {
                    screenId
                });
                throw new ErrorWithStatus(`can not find screen with screen_id ${screenId}`, status.INVALID_ARGUMENT);
            }

            const screenWithDisplayNameRecord = await screenDM.getScreenByDisplayNameWithXLock(displayName);
            if (screenWithDisplayNameRecord !== null) {
                this.logger.error("display_name has already been taken", {
                    displayName
                });
                throw new ErrorWithStatus(`display_name ${displayName} has already been taken`, status.ALREADY_EXISTS);
            }

            await screenDM.updateScreen({
                screenId: screenId,
                displayName: displayName
            })

            screenRecord.displayName = displayName;

            return screenRecord;
        })

    }

    public async deleteScreen(id: number): Promise<void> {
        return this.screenDM.deleteScreen(id);

    }

    private isValidDisplayName(displayName: string): boolean {
        return validator.isLength(displayName, { min: 1, max: 256 });
    }

    private sanitizeDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }
}

injected(
    ScreenManagementOperatorImpl,
    LOGGER_TOKEN,
    SCREEN_DATA_ACCESSOR_TOKEN,
    SCREEN_TYPE_DATA_ACCESSOR_TOKEN,
    SCREEN_CREATED_PRODUCER_TOKEN
);

export const SCREEN_MANAGEMENT_OPERATOR_TOKEN = token<ScreenManagementOperator>("ScreenManagementOperator");