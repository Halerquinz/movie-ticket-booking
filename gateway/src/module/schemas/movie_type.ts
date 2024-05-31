export class MovieType {
    constructor(
        public id: number,
        public display_name: string
    ) { }

    public static fromProto(MovieGenreProto: any | undefined): MovieType {
        return new MovieType(
            MovieGenreProto?.id || 0,
            MovieGenreProto?.displayName || "",
        );
    }
}