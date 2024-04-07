import { injected, token } from "brandi";
import { Logger } from "winston";
import { ScreenCreated } from "../dataaccess/kafka";
import { SEAT_MANAGEMENT_OPERATOR_TOKEN, SeatManagementOperator } from "../module/seat";
import { LOGGER_TOKEN } from "../utils";

export interface ScreenCreatedMessageHandler {
    onScreenCreated(message: ScreenCreated): Promise<void>;
}

export class ScreenCreatedMessageHandlerImpl implements ScreenCreatedMessageHandler {
    constructor(
        private readonly seatManagementOperator: SeatManagementOperator,
        private readonly logger: Logger
    ) { }

    public async onScreenCreated(message: ScreenCreated): Promise<void> {
        this.logger.info(
            "movie_service_screen_created message received",
            { payload: message }
        );

        const screenId = message.ofScreenId;
        if (screenId === undefined) {
            this.logger.error("screen_id is required", { payload: message });
            return;
        }

        const screenTypeId = message.ofScreenTypeId;
        if (screenTypeId === undefined) {
            this.logger.error("screen_type_id is required", { payload: message });
            return;
        }

        await this.seatManagementOperator.createAllSeatOfScreen(screenId, screenTypeId);
    }
}

injected(
    ScreenCreatedMessageHandlerImpl,
    SEAT_MANAGEMENT_OPERATOR_TOKEN,
    LOGGER_TOKEN
);

export const SCREEN_CREATED_MESSAGE_HANDLER_TOKEN =
    token<ScreenCreatedMessageHandler>(
        "ScreenCreatedMessageHandler"
    );