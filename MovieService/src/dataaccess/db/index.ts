import { Container } from "brandi";
import { KNEX_INSTANCE_TOKEN, newKnexInstance } from "./knex";
import { MOVIE_GENRE_DATA_ACCESSOR_TOKEN, MovieGenreDataAccessorImpl } from "./movie_genre";
import { MOVIE_DATA_ACCESSOR_TOKEN, MovieDataAccessorImpl } from "./movie";
import { MOVIE_HAS_MOVIE_GENRE_DATA_ACCESSOR_TOKEN, MovieHasMovieGenreDataAccessorImpl } from "./movie_has_movie_genre";
import { MOVIE_TRAILER_DATA_ACCESSOR_TOKEN, MovieTrailerDataAccessorImpl } from "./movie_trailer";
import { MOVIE_POSTER_DATA_ACCESSOR_TOKEN, MoviePosterDataAccessorImpl } from "./movie_poster";
import { MOVIE_IMAGE_DATA_ACCESSOR_TOKEN, MovieImageDataAccessorImpl } from "./movie_image";
import { THEATER_DATA_ACCESSOR_TOKEN, TheaterDataAccessorImpl } from "./theater";
import { SCREEN_TYPE_DATA_ACCESSOR_TOKEN, ScreenTypeDataAccessorImpl } from "./screen_type";
import { SCREEN_DATA_ACCESSOR_TOKEN, ScreenDataAccessorImpl } from "./screen";
import { SEAT_DATA_ACCESSOR_TOKEN, SeatDataAccessorImpl } from "./seat";
import { SHOWTIME_DATA_ACCESSOR_TOKEN, ShowtimeDataAccessorImpl } from "./showtime";
import { PRICE_DATA_ACCESSOR_TOKEN, PriceDataAccessorImpl } from "./price";
import { MOVIE_HAS_MOVIE_TYPE_DATA_ACCESSOR_TOKEN, MovieHasMovieTypeDataAccessorImpl } from "./movie_has_movie_type";

export * from "./knex";
export * from "./models";
export * from "./movie_genre";
export * from "./movie";
export * from "./movie_has_movie_genre";
export * from "./movie_has_movie_type";
export * from "./movie_trailer";
export * from "./movie_poster";
export * from "./movie_image";
export * from "./theater";
export * from "./screen_type";
export * from "./screen";
export * from "./seat";
export * from "./showtime";
export * from "./price";

export function bindToContainer(container: Container): void {
    container.bind(KNEX_INSTANCE_TOKEN).toInstance(newKnexInstance).inSingletonScope();
    container.bind(MOVIE_GENRE_DATA_ACCESSOR_TOKEN).toInstance(MovieGenreDataAccessorImpl).inSingletonScope();
    container.bind(MOVIE_DATA_ACCESSOR_TOKEN).toInstance(MovieDataAccessorImpl).inSingletonScope();
    container.bind(MOVIE_HAS_MOVIE_GENRE_DATA_ACCESSOR_TOKEN).toInstance(MovieHasMovieGenreDataAccessorImpl).inSingletonScope();
    container.bind(MOVIE_HAS_MOVIE_TYPE_DATA_ACCESSOR_TOKEN).toInstance(MovieHasMovieTypeDataAccessorImpl).inSingletonScope();
    container.bind(MOVIE_TRAILER_DATA_ACCESSOR_TOKEN).toInstance(MovieTrailerDataAccessorImpl).inSingletonScope();
    container.bind(MOVIE_POSTER_DATA_ACCESSOR_TOKEN).toInstance(MoviePosterDataAccessorImpl).inSingletonScope();
    container.bind(MOVIE_IMAGE_DATA_ACCESSOR_TOKEN).toInstance(MovieImageDataAccessorImpl).inSingletonScope();
    container.bind(THEATER_DATA_ACCESSOR_TOKEN).toInstance(TheaterDataAccessorImpl).inSingletonScope();
    container.bind(SCREEN_TYPE_DATA_ACCESSOR_TOKEN).toInstance(ScreenTypeDataAccessorImpl).inSingletonScope();
    container.bind(SCREEN_DATA_ACCESSOR_TOKEN).toInstance(ScreenDataAccessorImpl).inSingletonScope();
    container.bind(SEAT_DATA_ACCESSOR_TOKEN).toInstance(SeatDataAccessorImpl).inSingletonScope();
    container.bind(SHOWTIME_DATA_ACCESSOR_TOKEN).toInstance(ShowtimeDataAccessorImpl).inSingletonScope();
    container.bind(PRICE_DATA_ACCESSOR_TOKEN).toInstance(PriceDataAccessorImpl).inSingletonScope();
}