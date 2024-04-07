import { Container } from "brandi";

import * as infoProviders from "./info_providers";
import * as sessions from "./sessions";
import * as users from "./users";
import * as userPermissions from "./user_permissions";
import * as userRoles from "./user_roles";
import * as movieGenre from "./movie_genres";
import * as movie from "./movies";
import * as movieImage from "./movie_images";
import * as moviePoster from "./movie_poster";
import * as schemas from "./schemas";
import * as screenType from "./screen_types";
import * as screen from "./screens";
import * as theater from "./theaters";
import * as seat from "./seats";

export function bindToContainer(container: Container): void {
    schemas.bindToContainer(container);
    infoProviders.bindToContainer(container);
    sessions.bindToContainer(container);
    users.bindToContainer(container);
    userPermissions.bindToContainer(container);
    userRoles.bindToContainer(container);
    movieGenre.bindToContainer(container);
    movie.bindToContainer(container);
    movieImage.bindToContainer(container);
    moviePoster.bindToContainer(container);
    screenType.bindToContainer(container);
    screen.bindToContainer(container);
    theater.bindToContainer(container);
    seat.bindToContainer(container);
}