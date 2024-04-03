import { Container } from "brandi";
import { MOVIE_GENRE_MANAGEMENT_OPERATOR_TOKEN, MovieGenreManagementOperatorImpl } from "./movie_genre_management_operator";

export * from "./movie_genre_management_operator";

export function bindToContainer(container: Container) {
    container.bind(MOVIE_GENRE_MANAGEMENT_OPERATOR_TOKEN).toInstance(MovieGenreManagementOperatorImpl).inSingletonScope();
}