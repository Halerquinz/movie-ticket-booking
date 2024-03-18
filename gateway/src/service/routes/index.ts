import { Container, token } from "brandi";
import express from "express";
import { USERS_ROUTER_TOKEN, getUsersRouter } from "./users";
import { SESSIONS_ROUTER_TOKEN, getSessionsRouter } from "./sessions";

export const ROUTES_TOKEN = token<express.Router[]>("Routes");

export function bindToContainer(container: Container): void {
    container.bind(USERS_ROUTER_TOKEN).toInstance(getUsersRouter).inSingletonScope();
    container.bind(SESSIONS_ROUTER_TOKEN).toInstance(getSessionsRouter).inSingletonScope();

    container
        .bind(ROUTES_TOKEN)
        .toInstance(() => [
            container.get(USERS_ROUTER_TOKEN),
            container.get(SESSIONS_ROUTER_TOKEN)
        ])
        .inSingletonScope();
}