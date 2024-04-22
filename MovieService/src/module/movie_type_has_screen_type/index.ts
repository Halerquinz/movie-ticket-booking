import { Container } from "brandi";
import { MOVIE_TYPE_HAS_SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN, MovieTypeHasScreenTypeManagementOperatorImpl } from "./movie_type_has_screen_type_management_operator";

export * from "./movie_type_has_screen_type_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(MOVIE_TYPE_HAS_SCREEN_TYPE_MANAGEMENT_OPERATOR_TOKEN).toInstance(MovieTypeHasScreenTypeManagementOperatorImpl).inSingletonScope();
}