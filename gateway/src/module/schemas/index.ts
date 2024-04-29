import { Container } from "brandi";
import * as converters from "./converters";

export * from "./user";
export * from "./user_role";
export * from "./user_permission";
export * from "./movie";
export * from "./movie_genre";
export * from "./movie_image";
export * from "./movie_poster";
export * from "./screen_type";
export * from "./screen";
export * from "./theater";
export * from "./seat";
export * from "./movie_type";
export * from "./showtime";
export * from "./showtime_detail";
export * from "./showtime_slot";
export * from "./showtime_day_of_the_week";
export * from "./booking";
export * from "./payment_transaction";
export * from "./showtime_metadata";
export * from "./seat_metadata";

export function bindToContainer(container: Container): void {
    converters.bindToContainer(container);
}