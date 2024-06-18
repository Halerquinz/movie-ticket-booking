import { token } from "brandi";

export class ApplicationConfig {
    public expireTimeAfterInitializeBooking = "5m";
    public bookingTimeBeforeShowtimeStart = "1h";
    public multiplier = 10 ** 5; // 10^5

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        if (process.env.EXPIRE_TIME_AFTER_INITIALIZE_BOOKING !== undefined) {
            config.expireTimeAfterInitializeBooking = process.env.EXPIRE_TIME_AFTER_INITIALIZE_BOOKING;
        }
        if (process.env.BOOKING_TIME_BEFORE_SHOWTIME_START !== undefined) {
            config.bookingTimeBeforeShowtimeStart = process.env.BOOKING_TIME_BEFORE_SHOWTIME_START;
        }
        if (process.env.MULTIPLIER !== undefined) {
            config.multiplier = +process.env.MULTIPLIER;
        }
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN = token<ApplicationConfig>("ApplicationConfig");
