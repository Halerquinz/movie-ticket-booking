import { token } from "brandi";

export class ApplicationConfig {
    public bookingTime = "10m";

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        if (process.env.BOOKING_TIME !== undefined) {
            config.bookingTime = process.env.BOOKING_TIME
        }
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN = token<ApplicationConfig>("ApplicationConfig");
