import { Container } from "brandi";

import * as infoProviders from "./info_providers";
import * as sessions from "./sessions";
import * as users from "./users";
import * as userPermissions from "./user_permissions";
import * as userRoles from "./user_roles";
import * as movieGenres from "./movie_genres";
import * as movies from "./movies";
import * as schemas from "./schemas";
import * as screenTypes from "./screen_types";
import * as screens from "./screens";
import * as theaters from "./theaters";
import * as seats from "./seats";
import * as showtimes from "./showtimes";
import * as bookings from "./bookings";
import * as paymentTransactions from "./payment_transactions";

export function bindToContainer(container: Container): void {
    schemas.bindToContainer(container);
    infoProviders.bindToContainer(container);
    sessions.bindToContainer(container);
    users.bindToContainer(container);
    userPermissions.bindToContainer(container);
    userRoles.bindToContainer(container);
    movieGenres.bindToContainer(container);
    movies.bindToContainer(container);
    screenTypes.bindToContainer(container);
    screens.bindToContainer(container);
    theaters.bindToContainer(container);
    seats.bindToContainer(container);
    showtimes.bindToContainer(container);
    bookings.bindToContainer(container);
    paymentTransactions.bindToContainer(container);
}