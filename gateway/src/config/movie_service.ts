import { token } from "brandi";

export class MovieServiceConfig {
    public protoPath = "./src/proto/dependencies/movie_service.proto";
    public host = "127.0.0.1";
    public port = 20001;

    public static fromEnv(): MovieServiceConfig {
        const config = new MovieServiceConfig();
        if (process.env.MOVIE_SERVICE_PROTO_PATH !== undefined) {
            config.protoPath = process.env.MOVIE_SERVICE_PROTO_PATH;
        }
        if (process.env.MOVIE_SERVICE_HOST !== undefined) {
            config.host = process.env.MOVIE_SERVICE_HOST;
        }
        if (process.env.MOVIE_SERVICE_PORT !== undefined) {
            config.port = +process.env.MOVIE_SERVICE_PORT;
        }
        return config;
    }
}

export const MOVIE_SERVICE_CONFIG_TOKEN = token<MovieServiceConfig>("MovieServiceConfig");
