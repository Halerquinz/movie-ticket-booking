import { MoviePoster } from "./movie_poster";
import { MovieTrailer } from "./movie_trailer";
import { Movie as MovieProto } from "../../proto/gen/Movie";
import { MovieType } from "./movie_type";

export class Movie {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public duration: number,
        public release_date: number,
        public trailer: MovieTrailer,
        public poster: MoviePoster,
        public movie_type: MovieType
    ) { }

    public static fromProto(movieProto: MovieProto | undefined | null): Movie {
        const movieType = MovieType.fromProto(movieProto?.movieType);
        const movieTrailer = MovieTrailer.fromProto(movieProto?.trailer);
        return new Movie(
            movieProto?.id || 0,
            movieProto?.title || "",
            movieProto?.description || "",
            movieProto?.duration || 0,
            movieProto?.releaseDate as number || 0,
            movieTrailer,
            movieProto?.poster as any || null,
            movieType
        );
    }
}