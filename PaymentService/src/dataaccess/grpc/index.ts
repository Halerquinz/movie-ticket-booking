import { Container } from "brandi";
import { getMovieServiceDM, MOVIE_SERVICE_DM_TOKEN } from "./movie_service";
import { BOOKING_SERVICE_DM_TOKEN, getBookingServiceDM } from "./booking_service";

export * from "./movie_service";
export * from "./booking_service";

export function bindToContainer(container: Container): void {
    container
        .bind(BOOKING_SERVICE_DM_TOKEN)
        .toInstance(getBookingServiceDM)
        .inSingletonScope();
    container
        .bind(MOVIE_SERVICE_DM_TOKEN)
        .toInstance(getMovieServiceDM)
        .inSingletonScope();
}
