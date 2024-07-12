import { injected, token } from "brandi";
import { Logger } from "winston";
import { MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { MovieServiceClient } from "../../proto/gen/movie_service/MovieService";
import { ErrorWithHTTPCode, LOGGER_TOKEN, getHttpCodeFromGRPCStatus, promisifyGRPCCall, } from "../../utils";
import { Showtime, ShowtimeMetadata } from "../schemas";
import { POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN, PosterProtoToPosterConverter } from "../schemas/converters";

export interface ShowtimeManagementOperator {
    createShowtime(
        movieId: number,
        screenId: number,
        timeStart: number,
    ): Promise<Showtime>;
    getShowtimeMetadata(showtimeId: number): Promise<ShowtimeMetadata>;
}

export class ShowtimeManagementOperatorImpl implements ShowtimeManagementOperator {
    constructor(
        private readonly movieServiceDM: MovieServiceClient,
        private readonly logger: Logger,
        private readonly posterProtoToPosterConverter: PosterProtoToPosterConverter,
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

    public async getShowtimeMetadata(showtimeId: number): Promise<ShowtimeMetadata> {
        const { error: getShowtimeMetadataError, response: getShowtimeMetadataResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getShowtimeMetadata.bind(this.movieServiceDM),
            { showtimeId }
        );

        if (getShowtimeMetadataError !== null) {
            this.logger.error("failed to call movie_service.getShowtimeMetadata()", { error: getShowtimeMetadataError });
            throw new ErrorWithHTTPCode("failed to get showtime metadata", getHttpCodeFromGRPCStatus(getShowtimeMetadataError.code));
        }

        const showtimeMetadata = getShowtimeMetadataResponse?.showtimeMetadata;
        if (showtimeMetadata?.movie && showtimeMetadata.movie.poster) {
            const moviePosterProto = await this.posterProtoToPosterConverter.convert(getShowtimeMetadataResponse?.showtimeMetadata?.movie?.poster);
            showtimeMetadata.movie.poster = moviePosterProto as any;
        }

        return ShowtimeMetadata.fromProto(showtimeMetadata);
    }
}

injected(
    ShowtimeManagementOperatorImpl,
    MOVIE_SERVICE_DM_TOKEN,
    LOGGER_TOKEN,
    POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN
);

export const SHOWTIME_MANAGEMENT_OPERATOR_TOKEN = token<ShowtimeManagementOperatorImpl>("ShowtimeManagementOperator");