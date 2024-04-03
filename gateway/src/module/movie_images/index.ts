import { Container } from "brandi";
import { MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN, MovieImageManagementOperatorImpl } from "./movie_image_management_operator";

export * from "./movie_image_management_operator";

export function bindToContainer(container: Container) {
    container.bind(MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN).toInstance(MovieImageManagementOperatorImpl).inSingletonScope();
}