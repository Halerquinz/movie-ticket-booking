import { Container } from "brandi";
import { MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN, MoviePosterManagementOperatorImpl } from "./movie_poster_management_operator";

export * from "./movie_poster_management_operator";

export function bindToContainer(container: Container) {
    container.bind(MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN).toInstance(MoviePosterManagementOperatorImpl).inSingletonScope();
}