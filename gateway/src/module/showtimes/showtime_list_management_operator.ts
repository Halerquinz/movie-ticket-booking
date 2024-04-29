import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { ShowtimeDetail, Theater } from "../schemas";

export interface ShowtimeListManagementOperator {
    getShowtimeListOfTheater(
        theaterId: number,
        requestTime: number
    ): Promise<{
        theater: Theater,
        showtimeListOfTheater: ShowtimeDetail[]
    }>;
    getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number
    ): Promise<{
        theater: Theater,
        showtimeListOfTheater: ShowtimeDetail[]
    }>,
}

export class ShowtimeListManagementOperatorImpl implements ShowtimeListManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
    ) { }

    public async getShowtimeListOfTheater(
        theaterId: number,
        requestTime: number
    ): Promise<{
        theater: Theater,
        showtimeListOfTheater: ShowtimeDetail[]
    }> {
        const { error: getShowtimeListOfTheaterError, response: getShowtimeListOfTheaterResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getShowtimeListOfTheater.bind(this.movieServiceDM),
            { theaterId, requestTime }
        );

        if (getShowtimeListOfTheaterError !== null) {
            this.logger.error("failed to call movie_service.getShowtimeListOfTheaterError()", { error: getShowtimeListOfTheaterError });
            throw new ErrorWithHTTPCode("failed to get showtime list of theater", getHttpCodeFromGRPCStatus(getShowtimeListOfTheaterError.code));
        }

        const theater = Theater.fromProto(getShowtimeListOfTheaterResponse?.theater);
        const showtimeListOfTheater = getShowtimeListOfTheaterResponse?.showtimeListOfTheater?.map(
            (showtimeDetail) => ShowtimeDetail.fromProto(showtimeDetail)
        ) || [];

        return {
            theater,
            showtimeListOfTheater
        }
    }

    public async getShowtimeListOfTheaterByMovieId(
        theaterId: number,
        movieId: number,
        requestTime: number
    ): Promise<{
        theater: Theater;
        showtimeListOfTheater: ShowtimeDetail[];
    }> {
        const { error: getShowtimeListOfTheaterError, response: getShowtimeListOfTheaterResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getShowtimeListOfTheaterByMovieId.bind(this.movieServiceDM),
            { theaterId, movieId, requestTime }
        );

        if (getShowtimeListOfTheaterError !== null) {
            this.logger.error("failed to call movie_service.getShowtimeListOfTheaterError()", { error: getShowtimeListOfTheaterError });
            throw new ErrorWithHTTPCode("failed to get showtime list of theater", getHttpCodeFromGRPCStatus(getShowtimeListOfTheaterError.code));
        }

        const theater = Theater.fromProto(getShowtimeListOfTheaterResponse?.theater);
        const showtimeListOfTheater = getShowtimeListOfTheaterResponse?.showtimeListOfTheater?.map(
            (showtimeDetail) => ShowtimeDetail.fromProto(showtimeDetail)
        ) || [];

        return {
            theater,
            showtimeListOfTheater
        }
    }
}

injected(
    ShowtimeListManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN
);

export const SHOWTIME_LIST_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeListManagementOperatorImpl>("ShowtimeListManagementOperator");