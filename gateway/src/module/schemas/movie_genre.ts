export class MovieGenre {
    constructor(
        public id: number,
        public display_name: string
    ) { }

    public static fromProto(MovieGenreProto: any | undefined): MovieGenre {
        return new MovieGenre(
            MovieGenreProto?.id || 0,
            MovieGenreProto?.displayName || "",
        );
    }
}