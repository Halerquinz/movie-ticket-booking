import { CookieOptions } from "express";

// Authentication cookie should expire in 7 days
const MOVIE_TICKET_BOOKING_AUTH_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

export function getCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        sameSite: "strict",
        maxAge: MOVIE_TICKET_BOOKING_AUTH_COOKIE_MAX_AGE,
    };
}
