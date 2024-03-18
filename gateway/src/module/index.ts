import { Container } from "brandi";

import * as sessions from "./sessions";
import * as users from "./users";

export function bindToContainer(container: Container): void {
    sessions.bindToContainer(container);
    users.bindToContainer(container);
}