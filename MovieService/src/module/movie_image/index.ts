import { Container } from "brandi";
import { IMAGE_PROCESSOR_TOKEN, ImageProcessorImpl } from "./image_processor";
import { MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN, MovieImageManagementOperatorImpl } from "./movie_image_management_operator";
import { MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN, MoviePosterManagementOperatorImpl } from "./movie_poster_management_operator";

export * from "./image_processor";
export * from "./movie_image_management_operator";
export * from "./movie_poster_management_operator";

export function bindToContainer(container: Container) {
    container.bind(IMAGE_PROCESSOR_TOKEN).toInstance(ImageProcessorImpl).inSingletonScope();
    container.bind(MOVIE_IMAGE_MANAGEMENT_OPERATOR_TOKEN).toInstance(MovieImageManagementOperatorImpl).inSingletonScope();
    container.bind(MOVIE_POSTER_MANAGEMENT_OPERATOR_TOKEN).toInstance(MoviePosterManagementOperatorImpl).inSingletonScope();
}