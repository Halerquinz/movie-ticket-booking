import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/movie_service/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Screen } from "../schemas";

export interface ScreenManagementOperator {
    createScreen(
        theaterId: number,
        screenTypeId: number,
        displayName: string
    ): Promise<Screen>;
    deleteScreen(id: number): Promise<void>;
}

export class ScreenManagementOperatorImpl implements ScreenManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createScreen(theaterId: number, screenTypeId: number, displayName: string): Promise<Screen> {
        const { error: createScreenError, response: createScreenResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createScreen.bind(this.movieServiceDM),
            { theaterId, screenTypeId, displayName }
        );

        if (createScreenError !== null) {
            this.logger.error("failed to call movie_service.createScreen()", { error: createScreenError });
            throw new ErrorWithHTTPCode("failed to create screen", getHttpCodeFromGRPCStatus(createScreenError.code));
        }

        return Screen.fromProto(createScreenResponse?.screen);
    }

    public async deleteScreen(id: number): Promise<void> {
        const { error: deleteScreenError } = await promisifyGRPCCall(
            this.movieServiceDM.deleteScreen.bind(this.movieServiceDM), { id }
        );

        if (deleteScreenError !== null) {
            this.logger.error("failed to call movie.deleteScreen()", { error: deleteScreenError });
            throw new ErrorWithHTTPCode(
                "failed to delete screen",
                getHttpCodeFromGRPCStatus(deleteScreenError.code)
            );
        }

    }
}

injected(
    ScreenManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const SCREEN_MANAGEMENT_OPERATOR_TOKEN = token<ScreenManagementOperatorImpl>("ScreenManagementOperator");