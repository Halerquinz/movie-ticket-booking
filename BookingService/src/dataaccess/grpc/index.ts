import { Container } from "brandi";
import { getMovieServiceDM, MOVIE_SERVICE_DM_TOKEN } from "./movie_service";
import { getUserServiceDM, USER_SERVICE_DM_TOKEN } from "./user_service";

export * from "./movie_service";
export * from "./user_service";

export function bindToContainer(container: Container): void {
    container
        .bind(USER_SERVICE_DM_TOKEN)
        .toInstance(getUserServiceDM)
        .inSingletonScope();
    container
        .bind(MOVIE_SERVICE_DM_TOKEN)
        .toInstance(getMovieServiceDM)
        .inSingletonScope();
}
