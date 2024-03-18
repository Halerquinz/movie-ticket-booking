import { token } from "brandi";

export class UserServiceConfig {
    public protoPath = "./src/proto/dependencies/user_service.proto";
    public host = "127.0.0.1";
    public port = 20000;

    public static fromEnv(): UserServiceConfig {
        const config = new UserServiceConfig();
        if (process.env.USER_SERVICE_PROTO_PATH !== undefined) {
            config.protoPath = process.env.USER_SERVICE_PROTO_PATH;
        }
        if (process.env.USER_SERVICE_HOST !== undefined) {
            config.host = process.env.USER_SERVICE_HOST;
        }
        if (process.env.USER_SERVICE_PORT !== undefined) {
            config.port = +process.env.USER_SERVICE_PORT;
        }
        return config;
    }
}

export const USER_SERVICE_CONFIG_TOKEN = token<UserServiceConfig>("UserServiceConfig");
