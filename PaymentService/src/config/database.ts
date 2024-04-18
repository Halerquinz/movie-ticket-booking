import { token } from "brandi";

export class DatabaseConfig {
    public host = "127.0.0.0";
    public port = 5432;
    public user = "postgres";
    public password = "201171";
    public database = "movie_ticket_booking_payment_service_db";

    public static fromEnv(): DatabaseConfig {
        const config = new DatabaseConfig();
        if (process.env.POSTGRES_HOST !== undefined) {
            config.host = process.env.POSTGRES_HOST;
        }
        if (process.env.POSTGRES_PORT !== undefined) {
            config.port = +process.env.POSTGRES_PORT;
        }
        if (process.env.POSTGRES_USER !== undefined) {
            config.user = process.env.POSTGRES_USER;
        }
        if (process.env.POSTGRES_PASSWORD !== undefined) {
            config.password = process.env.POSTGRES_PASSWORD;
        }
        if (process.env.POSTGRES_DB !== undefined) {
            config.database = process.env.POSTGRES_DB;
        }
        return config;
    }
}

export const DATABASE_CONFIG_TOKEN = token<DatabaseConfig>("DatabaseConfig");