import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Showtime } from "../schemas";

export interface ShowtimeManagementOperator {
    createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
    ): Promise<Showtime>;
}

export class ShowtimeManagementOperatorImpl implements ShowtimeManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
    ): Promise<Showtime> {
        const { error: createShowtimeError, response: createShowtimeResponse } = await promisifyGRPCCall(
            this.movieServiceDM.createShowtime.bind(this.movieServiceDM),
            { movieId, screenId, timeStart }
        );

        if (createShowtimeError !== null) {
            this.logger.error("failed to call movie_service.createShowtime()", { error: createShowtimeError });
            throw new ErrorWithHTTPCode("failed to create showtime", getHttpCodeFromGRPCStatus(createShowtimeError.code));
        }

        return Showtime.fromProto(createShowtimeResponse?.showtime);
    }
}

injected(
    ShowtimeManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const SHOWTIME_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeManagementOperatorImpl>("ShowtimeManagementOperator");