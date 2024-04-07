export class MovieImage {
    constructor(
        public image_id: number,
        public of_movie_id: number,
        public original_filename: string,
        public original_image_url: string,
        public thumbnail_url: string,
    ) { }
}
