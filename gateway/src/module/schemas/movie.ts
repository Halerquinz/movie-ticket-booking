export class Movie {
    constructor(
        public movie_id: number,
        public title: string,
        public description: string,
        public duration: number,
        public release_date: number,
    ) { }

    public static fromProto(MovieProto: any | undefined): Movie {
        return new Movie(
            MovieProto?.id || 0,
            MovieProto?.title || "",
            MovieProto?.description || "",
            MovieProto?.duration || 0,
            MovieProto?.releaseDate || 0
        )
    }
}