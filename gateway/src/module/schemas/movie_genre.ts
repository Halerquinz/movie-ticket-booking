export class MovieGenre {
    constructor(
        public movie_genre_id: number,
        public display_name: string
    ) { }

    public static fromProto(MovieGenreProto: any | undefined): MovieGenre {
        return new MovieGenre(
            MovieGenreProto?.movieGenreId || 0,
            MovieGenreProto?.displayName || "",
        )
    }
}