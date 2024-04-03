export class MoviePoster {
    constructor(
        public of_movie_id: number,
        public original_filename: string,
        public original_image_filename: string,
        public thumbnail_image_filename: string
    ) { }

    public static fromProto(MoviePosterProto: any | undefined): MoviePoster {
        return new MoviePoster(
            MoviePosterProto?.ofMovieId || 0,
            MoviePosterProto?.originalFileName || "",
            MoviePosterProto?.originalImageFileName || "",
            MoviePosterProto?.thumbnailImageFileName || ""
        )
    }
}
