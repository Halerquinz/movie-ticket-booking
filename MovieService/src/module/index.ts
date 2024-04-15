import { Container } from "brandi";
import * as movie from "./movie";
import * as movieGenre from "./movie_genre";
import * as screen from "./screen";
import * as screenType from "./screen_type";
import * as seat from "./seat";
import * as showtime from "./showtime";
import * as theater from "./theater";
import * as price from "./price";

export function bindToContainer(container: Container): void {
    movie.bindToContainer(container);
    movieGenre.bindToContainer(container);
    screen.bindToContainer(container);
    screenType.bindToContainer(container);
    seat.bindToContainer(container);
    showtime.bindToContainer(container);
    theater.bindToContainer(container);
    price.bindToContainer(container);
}
