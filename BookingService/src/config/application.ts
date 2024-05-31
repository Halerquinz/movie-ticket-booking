import { token } from "brandi";

export class ApplicationConfig {
    public expireTimeAfterInitializeBooking = "1m";
    public bookingTimeBeforeShowtimeStart = "1h";

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        if (process.env.BOOKING_TIME !== undefined) {
            config.expireTimeAfterInitializeBooking = process.env.BOOKING_TIME;
        }
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN = token<ApplicationConfig>("ApplicationConfig");
