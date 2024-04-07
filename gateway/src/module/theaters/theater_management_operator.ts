import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Theater } from "../schemas";

export interface TheaterManagementOperator {
    createTheater(
        displayName: string,
        location: string,
    ): Promise<Theater>;
    deleteTheater(id: number): Promise<void>;
}

export class TheaterManagementOperatorImpl implements TheaterManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createTheater(
        displayName: string,
        location: string,
    ): Promise<Theater> {
        const { error: createTheaterError, response: createTheaterResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createTheater.bind(this.movieServiceDM),
            { displayName, location }
        );

        if (createTheaterError !== null) {
            this.logger.error("failed to call movie_service.createTheater()", { error: createTheaterError });
            throw new ErrorWithHTTPCode("failed to create theater", getHttpCodeFromGRPCStatus(createTheaterError.code));
        }

        return Theater.fromProto(createTheaterResponse);
    }

    public async deleteTheater(id: number): Promise<void> {
        const { error: deleteTheaterError } = await promisifyGRPCCall(
            this.movieServiceDM.deleteScreenType.bind(this.movieServiceDM), { id }
        );

        if (deleteTheaterError !== null) {
            this.logger.error("failed to call movie.deleteTheater()", { error: deleteTheaterError });
            throw new ErrorWithHTTPCode(
                "failed to delete theater",
                getHttpCodeFromGRPCStatus(deleteTheaterError.code)
            );
        }

    }
}

injected(
    TheaterManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const THEATER_MANAGEMENT_OPERATOR_TOKEN = token<TheaterManagementOperatorImpl>("TheaterManagementOperator");