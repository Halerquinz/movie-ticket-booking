import { Container } from "brandi";
import * as converters from "./converters";

export * from "./user";
export * from "./user_role";
export * from "./user_permission";
export * from "./user_tag";
export * from "./movie";
export * from "./movie_genre";
export * from "./movie_image";
export * from "./movie_poster";
export * from "./screen_type";
export * from "./screen";
export * from "./theater";
export * from "./seat";

export function bindToContainer(container: Container): void {
    converters.bindToContainer(container);
}