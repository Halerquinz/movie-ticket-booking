import { Container, token } from "brandi";
import express from "express";
import { USERS_ROUTER_TOKEN, getUsersRouter } from "./users";
import { SESSIONS_ROUTER_TOKEN, getSessionsRouter } from "./sessions";
import { USER_ROLES_ROUTER_TOKEN } from "./roles";
import { USER_PERMISSIONS_ROUTER_TOKEN, getUserPermissionsRouter } from "./permissions";
import { MOVIE_GENRES_ROUTER_TOKEN, getMovieGenresRouter } from "./movie-genres";
import { MOVIE_IMAGES_ROUTER_TOKEN, getMovieImagesRouter } from "./movie-images";
import { MOVIE_POSTERS_ROUTER_TOKEN, getMoviePostersRouter } from "./movie-posters";
import { MOVIES_ROUTER_TOKEN, getMoviesRouter } from "./movies";
import { SCREEN_TYPES_ROUTER_TOKEN, getScreenTypesRouter } from "./screen-types";
import { SCREENS_ROUTER_TOKEN, getScreensRouter } from "./screens";
import { THEATERS_ROUTER_TOKEN, getTheatersRouter } from "./theaters";

export const ROUTES_TOKEN = token<express.Router[]>("Routes");

export function bindToContainer(container: Container): void {
    container.bind(USERS_ROUTER_TOKEN).toInstance(getUsersRouter).inSingletonScope();
    container.bind(SESSIONS_ROUTER_TOKEN).toInstance(getSessionsRouter).inSingletonScope();
    container.bind(USER_ROLES_ROUTER_TOKEN).toInstance(getUsersRouter).inSingletonScope();
    container.bind(USER_PERMISSIONS_ROUTER_TOKEN).toInstance(getUserPermissionsRouter).inSingletonScope();
    container.bind(MOVIE_GENRES_ROUTER_TOKEN).toInstance(getMovieGenresRouter).inSingletonScope();
    container.bind(MOVIE_IMAGES_ROUTER_TOKEN).toInstance(getMovieImagesRouter).inSingletonScope();
    container.bind(MOVIE_POSTERS_ROUTER_TOKEN).toInstance(getMoviePostersRouter).inSingletonScope();
    container.bind(MOVIES_ROUTER_TOKEN).toInstance(getMoviesRouter).inSingletonScope();
    container.bind(SCREEN_TYPES_ROUTER_TOKEN).toInstance(getScreenTypesRouter).inSingletonScope();
    container.bind(SCREENS_ROUTER_TOKEN).toInstance(getScreensRouter).inSingletonScope();
    container.bind(THEATERS_ROUTER_TOKEN).toInstance(getTheatersRouter).inSingletonScope();

    container
        .bind(ROUTES_TOKEN)
        .toInstance(() => [
            container.get(USERS_ROUTER_TOKEN),
            container.get(SESSIONS_ROUTER_TOKEN),
            container.get(USER_ROLES_ROUTER_TOKEN),
            container.get(USER_PERMISSIONS_ROUTER_TOKEN),
            container.get(MOVIE_GENRES_ROUTER_TOKEN),
            container.get(MOVIE_IMAGES_ROUTER_TOKEN),
            // container.get(MOVIE_POSTERS_ROUTER_TOKEN),
            // container.get(MOVIES_ROUTER_TOKEN),
            container.get(SCREEN_TYPES_ROUTER_TOKEN),
            container.get(SCREENS_ROUTER_TOKEN),
            container.get(THEATERS_ROUTER_TOKEN),
        ])
        .inSingletonScope();
}