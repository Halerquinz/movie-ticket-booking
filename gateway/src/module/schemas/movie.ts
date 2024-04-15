import { MovieTrailer } from "../../proto/gen/MovieTrailer";
import { MoviePoster } from "./movie_poster";

export class Movie {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public duration: number,
        public release_date: number,
        public trailer: MovieTrailer,
        public poster: MoviePoster
    ) { }

    public static fromProto(MovieProto: any | undefined): Movie {
        return new Movie(
            MovieProto?.id || 0,
            MovieProto?.title || "",
            MovieProto?.description || "",
            MovieProto?.duration || 0,
            MovieProto?.releaseDate || 0,
            MovieProto?.trailer || null,
            MovieProto?.poster || null
        )
    }
}