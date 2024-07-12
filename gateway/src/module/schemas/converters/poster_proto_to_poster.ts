import { injected, token } from "brandi";
import httpStatus from "http-status";
import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../../config";
import { MoviePoster as MoviePosterProto } from "../../../proto/gen/movie_service/MoviePoster";
import { ErrorWithHTTPCode, LOGGER_TOKEN } from "../../../utils";
import { MoviePoster } from "../movie_poster";

export interface PosterProtoToPosterConverter {
    convert(moviePosterProto: MoviePosterProto | undefined): Promise<MoviePoster>;
}

export class PosterProtoToPosterConverterImpl implements PosterProtoToPosterConverter {
    constructor(
        private readonly applicationConfig: ApplicationConfig,
        private readonly logger: Logger
    ) { }

    public async convert(moviePosterProto: MoviePosterProto | undefined): Promise<MoviePoster> {
        if (moviePosterProto?.ofMovieId === undefined) {
            this.logger.error("poster has no movie");
            throw new ErrorWithHTTPCode(
                "poster has no movie",
                httpStatus.INTERNAL_SERVER_ERROR
            );
        }

        const originalFileName = moviePosterProto?.originalFileName || "";

        const originalPosterFileURL = this.getOriginalPosterFileURL(
            moviePosterProto?.originalImageFileName || ""
        );

        return new MoviePoster(
            +moviePosterProto?.ofMovieId,
            originalFileName,
            originalPosterFileURL,
        );
    }

    private getOriginalPosterFileURL(originalPosterFilename: string): string {
        return `http://${this.applicationConfig.posterURLPrefix}/${originalPosterFilename}`;
    }
}

injected(
    PosterProtoToPosterConverterImpl,
    APPLICATION_CONFIG_TOKEN,
    LOGGER_TOKEN
);

export const POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN = token<PosterProtoToPosterConverter>("PosterProtoToPosterConverter");
