import { Container } from "brandi";
import { MOVIE_MANAGEMENT_OPERATOR_TOKEN, MovieManagementOperatorImpl } from "./movie_management_operator";
import { MOVIE_IMAGE_OPERATOR_TOKEN, MovieImageOperatorImpl } from "./movie_image_operator";
import { MOVIE_POSTER_OPERATOR_TOKEN, MoviePosterOperatorImpl } from "./movie_poster_operator";
import { IMAGE_PROCESSOR_TOKEN, ImageProcessorImpl } from "./image_processor";

export * from "./movie_management_operator";
export * from "./image_processor";
export * from "./movie_image_operator";
export * from "./movie_poster_operator";

export function bindToContainer(container: Container): void {
    container.bind(IMAGE_PROCESSOR_TOKEN).toInstance(ImageProcessorImpl).inSingletonScope();
    container.bind(MOVIE_MANAGEMENT_OPERATOR_TOKEN).toInstance(MovieManagementOperatorImpl).inSingletonScope();
    container.bind(MOVIE_IMAGE_OPERATOR_TOKEN).toInstance(MovieImageOperatorImpl).inSingletonScope();
    container.bind(MOVIE_POSTER_OPERATOR_TOKEN).toInstance(MoviePosterOperatorImpl).inSingletonScope();
}