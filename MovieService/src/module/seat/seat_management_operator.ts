import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Logger } from "winston";
import {
    SCREEN_DATA_ACCESSOR_TOKEN,
    SCREEN_TYPE_DATA_ACCESSOR_TOKEN,
    SEAT_DATA_ACCESSOR_TOKEN,
    ScreenDataAccessor,
    ScreenTypeDataAccessor,
    SeatDataAccessor,
    SeatTypeId
} from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface SeatManagementOperator {
    createAllSeatOfScreen(screenId: number, screenTypeId: number): Promise<void>;
}

export class SeatManagementOperatorImpl implements SeatManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly seatDM: SeatDataAccessor,
        private readonly screenDM: ScreenDataAccessor,
        private readonly screenTypeDM: ScreenTypeDataAccessor
    ) { }

    public async createAllSeatOfScreen(screenId: number, screenTypeId: number): Promise<void> {
        const screenTypeRecord = await this.screenTypeDM.getScreenTypeById(screenTypeId);
        if (screenTypeRecord === null) {
            this.logger.error("can not find screen type with id");
            throw new ErrorWithStatus(`can not find screen type with id`, status.INVALID_ARGUMENT);
        }

        const screenRecord = await this.screenDM.getScreenById(screenId);
        if (screenRecord === null) {
            this.logger.error("can not find screen with id");
            throw new ErrorWithStatus(`can not find screen with id`, status.INVALID_ARGUMENT);
        }

        const { rowCount, seatOfRowCount } = screenTypeRecord;

        const seatRowNameAlphaMap = new Map();
        for (let i = 0; i < 26; i++) {
            seatRowNameAlphaMap.set(i + 1, String.fromCharCode(65 + i));
        }

        await this.seatDM.withTransaction(async (seatDM) => {
            for (let i = 1; i <= rowCount; i++) {
                for (let j = 1; j <= seatOfRowCount; j++) {
                    // if column is less than 10 no is row01, row02 ...
                    let no: string = `${seatRowNameAlphaMap.get(i)}${j}`;
                    if (j < 10) {
                        no = `${seatRowNameAlphaMap.get(i)}0${j}`
                    }

                    await seatDM.createSeat({
                        ofScreenId: screenId,
                        row: seatRowNameAlphaMap.get(i),
                        ofSeatTypeId: SeatTypeId.NORMAL,
                        column: j,
                        no: no
                    })
                }
            }
        })
    }
}

injected(
    SeatManagementOperatorImpl,
    LOGGER_TOKEN,
    SEAT_DATA_ACCESSOR_TOKEN,
    SCREEN_DATA_ACCESSOR_TOKEN,
    SCREEN_TYPE_DATA_ACCESSOR_TOKEN
);

export const SEAT_MANAGEMENT_OPERATOR_TOKEN = token<SeatManagementOperator>("SeatManagementOperator");