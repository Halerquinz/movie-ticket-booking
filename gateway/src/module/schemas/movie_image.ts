export class MovieImage {
    constructor(
        public image_id: number,
        public of_movie_id: number,
        public original_filename: string,
        public original_image_filename: string,
        public thumbnail_image_fileName: string
    ) { }

    public static fromProto(MovieImageProto: any | undefined): MovieImage {
        return new MovieImage(
            MovieImageProto?.imageId || 0,
            MovieImageProto?.ofMovieId || 0,
            MovieImageProto?.originalFileName || "",
            MovieImageProto?.originalImageFileName || "",
            MovieImageProto?.thumbnailImageFileName || ""
        )
    }

}
