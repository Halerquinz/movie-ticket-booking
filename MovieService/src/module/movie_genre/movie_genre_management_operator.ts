import { Logger } from "winston";
import { MOVIE_GENRE_DATA_ACCESSOR_TOKEN, MovieGenre, MovieGenreDataAccessor, MovieHasMovieGenreDataAccessor } from "../../dataaccess/db";
import { ErrorWithStatus, LOGGER_TOKEN, Timer } from "../../utils";
import validator from "validator";
import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";

export interface MovieGenreManagementOperator {
    createMovieGenre(displayName: string): Promise<MovieGenre>;
    updateMovieGenre(id: number, displayName: string): Promise<MovieGenre>;
    deleteMovieGenre(id: number): Promise<void>;
}

export class MovieGenreManagementOperatorImpl implements MovieGenreManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly movieGenreDM: MovieGenreDataAccessor,
    ) { }

    public async createMovieGenre(displayName: string): Promise<MovieGenre> {
        displayName = this.sanitizeDisplayName(displayName);

        return this.movieGenreDM.withTransaction<MovieGenre>(async (movieGenreDM) => {
            const movieGenreRecord = await movieGenreDM.getMovieGenreByDisplayNameWithXLock(displayName);
            if (movieGenreRecord !== null) {
                this.logger.error("displayname has already been taken", {
                    displayName
                });
                throw new ErrorWithStatus(`displayname ${displayName} has already been taken`, status.ALREADY_EXISTS);
            }

            const createdMovieGenreId = await movieGenreDM.createMovieGenre(displayName);

            return {
                movieGenreId: createdMovieGenreId,
                displayName
            }
        })
    }

    public async updateMovieGenre(id: number, displayName: string): Promise<MovieGenre> {
        displayName = this.sanitizeDisplayName(displayName);

        return this.movieGenreDM.withTransaction<MovieGenre>(async (movieGenreDM) => {
            const movieGenreRecord = await movieGenreDM.getMovieGenreByIdWithXLock(id);
            if (movieGenreRecord === null) {
                this.logger.error("no movieGenre with id found", {
                    id
                });
                throw new ErrorWithStatus(`no movie genre with id${id}`, status.ALREADY_EXISTS);
            }

            const movieGenreWithDisplayNameRecord = await movieGenreDM.getMovieGenreByDisplayNameWithXLock(displayName);
            if (movieGenreWithDisplayNameRecord !== null && movieGenreWithDisplayNameRecord.displayName === displayName) {
                this.logger.error("displayname has already taken", { displayName });
                throw new ErrorWithStatus(`display name ${displayName} has already taken`, status.ALREADY_EXISTS);
            }

            movieGenreRecord.displayName = displayName

            await movieGenreDM.updateMovieGenre(movieGenreRecord)
            return movieGenreRecord;
        })
    }

    public async deleteMovieGenre(id: number): Promise<void> {
        return this.movieGenreDM.deleteMovieGenre(id);
    }

    private sanitizeDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }
}

injected(MovieGenreManagementOperatorImpl, LOGGER_TOKEN, MOVIE_GENRE_DATA_ACCESSOR_TOKEN);

export const MOVIE_GENRE_MANAGEMENT_OPERATOR = token<MovieGenreManagementOperator>("MovieGenreManagementOperator");