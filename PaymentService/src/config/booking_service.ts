import { token } from "brandi";

export class BookingServiceConfig {
    public protoPath = "./src/proto/dependencies/booking_service.proto";
    public host = "127.0.0.1";
    public port = 20002;

    public static fromEnv(): BookingServiceConfig {
        const config = new BookingServiceConfig();
        if (process.env.BOOKING_SERVICE_PROTO_PATH !== undefined) {
            config.protoPath = process.env.BOOKING_SERVICE_PROTO_PATH;
        }
        if (process.env.BOOKING_SERVICE_HOST !== undefined) {
            config.host = process.env.BOOKING_SERVICE_HOST;
        }
        if (process.env.BOOKING_SERVICE_PORT !== undefined) {
            config.port = +process.env.BOOKING_SERVICE_PORT;
        }
        return config;
    }
}

export const BOOKING_SERVICE_CONFIG_TOKEN = token<BookingServiceConfig>("BookingServiceConfig");
