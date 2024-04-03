import { Container } from "brandi";
import { MOVIE_MANAGEMENT_OPERATOR_TOKEN, MovieManagementOperatorImpl } from "./movie_management_operator";

export * from "./movie_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(MOVIE_MANAGEMENT_OPERATOR_TOKEN).toInstance(MovieManagementOperatorImpl).inSingletonScope();
}