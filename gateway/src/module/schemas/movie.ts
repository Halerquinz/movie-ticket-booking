import { MovieTrailer } from "../../proto/gen/MovieTrailer";
import { MoviePoster } from "./movie_poster";
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
        public movieType: MovieType
    ) { }

    public static fromProto(MovieProto: any | undefined): Movie {
        const movieType = MovieType.fromProto(MovieProto?.movieType);
        return new Movie(
            MovieProto?.id || 0,
            MovieProto?.title || "",
            MovieProto?.description || "",
            MovieProto?.duration || 0,
            MovieProto?.releaseDate || 0,
            MovieProto?.trailer || null,
            MovieProto?.poster || null,
            movieType
        )
    }
}