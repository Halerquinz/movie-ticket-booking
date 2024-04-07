import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { ScreenType } from "../schemas";

export interface ScreenTypeManagementOperator {
    createScreenType(
        displayName: string,
        description: string,
        seatCount: number,
        rowCount: number,
        seatOfRowCount: number
    ): Promise<ScreenType>;
    deleteScreenType(id: number): Promise<void>;
}

export class ScreenTypeManagementOperatorImpl implements ScreenTypeManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createScreenType(
        displayName: string,
        description: string,
        seatCount: number,
        rowCount: number,
        seatOfRowCount: number
    ): Promise<ScreenType> {
        const { error: createScreenTypeError, response: createScreenTypeResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createScreenType.bind(this.movieServiceDM),
            { description, displayName, rowCount, seatCount, seatOfRowCount }
        );

        if (createScreenTypeError !== null) {
            this.logger.error("failed to call movie_service.createScreenType()", { error: createScreenTypeError });
            throw new ErrorWithHTTPCode("failed to create screen type", getHttpCodeFromGRPCStatus(createScreenTypeError.code));
        }

        return ScreenType.fromProto(createScreenTypeResponse);
    }

    public async deleteScreenType(id: number): Promise<void> {
        const { error: deleteScreenTypeError } = await promisifyGRPCCall(
            this.movieServiceDM.deleteScreenType.bind(this.movieServiceDM), { id }
        );

        if (deleteScreenTypeError !== null) {
            this.logger.error("failed to call movie.deleteScreenType()", { error: deleteScreenTypeError });
            throw new ErrorWithHTTPCode(
                "failed to delete screen type",
                getHttpCodeFromGRPCStatus(deleteScreenTypeError.code)
            );
        }

    }
}

injected(
    ScreenTypeManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN = token<ScreenTypeManagementOperatorImpl>("ScreenTypeManagementOperator");