import { Container } from "brandi";
import { USER_SERVICE_DM_TOKEN, getUserServiceDM } from "./user_service";
import { MOVIE_SERVICE_DM_TOKEN, getMovieServiceDM } from "./movie_service";
import { BOOKING_SERVICE_DM_TOKEN, getBookingServiceDM } from "./booking_service";

export * from "./user_service";
export * from "./movie_service";
export * from "./booking_service";

export function bindToContainer(container: Container): void {
    container.bind(USER_SERVICE_DM_TOKEN).toInstance(getUserServiceDM).inSingletonScope();
    container.bind(MOVIE_SERVICE_DM_TOKEN).toInstance(getMovieServiceDM).inSingletonScope();
    container.bind(BOOKING_SERVICE_DM_TOKEN).toInstance(getBookingServiceDM).inSingletonScope();
}