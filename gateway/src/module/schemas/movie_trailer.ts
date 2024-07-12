import { MovieTrailer as MovieTrailerProto } from "../../proto/gen/movie_service/MovieTrailer";

export class MovieTrailer {
    constructor(
        public of_movie_id: number,
        public youtube_link_url: string
    ) { }

    public static fromProto(movieTrailerProto: MovieTrailerProto | undefined | null): MovieTrailer {
        return new MovieTrailer(
            movieTrailerProto?.ofMovieId || 0,
            movieTrailerProto?.youtubeLinkUrl || "",
        );
    }
}