import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";

export interface SeatManagementOperator {
    createAllSeatOfScreen(
        screenId: number,
        screenTypeId: number
    ): Promise<void>;
}

export class SeatManagementOperatorImpl implements SeatManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createAllSeatOfScreen(
        screenId: number,
        screenTypeId: number
    ): Promise<void> {
        const { error: createAllSeatOfScreenError } = await promisifyGRPCCall(
            this.movieServiceDM.createAllSeatOfScreen.bind(this.movieServiceDM),
            { screenId, screenTypeId }
        );

        if (createAllSeatOfScreenError !== null) {
            this.logger.error("failed to call movie_service.createAllSeatOfScreen()", { error: createAllSeatOfScreenError });
            throw new ErrorWithHTTPCode("failed to create all seat of screen", getHttpCodeFromGRPCStatus(createAllSeatOfScreenError.code));
        }
    }
}

injected(
    SeatManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const SEAT_MANAGEMENT_OPERATOR_TOKEN = token<SeatManagementOperatorImpl>("SeatManagementOperator");