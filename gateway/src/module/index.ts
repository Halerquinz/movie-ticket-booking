import { Container } from "brandi";

import * as infoProviders from "./info_providers";
import * as sessions from "./sessions";
import * as users from "./users";
import * as userPermissions from "./user_permissions";
import * as userRoles from "./user_roles";

export function bindToContainer(container: Container): void {
    infoProviders.bindToContainer(container);
    sessions.bindToContainer(container);
    users.bindToContainer(container);
    userPermissions.bindToContainer(container);
    userRoles.bindToContainer(container);
}