import { Container } from "brandi";
import { MOVIE_GENRE_MANAGEMENT_OPERATOR, MovieGenreManagementOperatorImpl } from "./movie_genre_management_operator";

export * from "./movie_genre_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(MOVIE_GENRE_MANAGEMENT_OPERATOR).toInstance(MovieGenreManagementOperatorImpl).inSingletonScope();
}