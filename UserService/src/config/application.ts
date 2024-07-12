import { token } from "brandi";

export class ApplicationConfig {
    public firstUserDisplayName = "";
    public firstUserUsername = "";
    public firstUserEmail = "";
    public firstUserPassword = "";
    public firstUserRoleDisplayName = "Admin";
    public firstUserRoleDescription = "";
    public firstUserPermissionPermissionNameList: string[] = [];

    public static fromEnv(): ApplicationConfig {
        const config = new ApplicationConfig();
        if (process.env.USER_SERVICE_FIRST_USER_DISPLAY_NAME !== undefined) {
            config.firstUserDisplayName = process.env.USER_SERVICE_FIRST_USER_DISPLAY_NAME;
        }
        if (process.env.USER_SERVICE_FIRST_USER_USERNAME !== undefined) {
            config.firstUserUsername = process.env.USER_SERVICE_FIRST_USER_USERNAME;
        }
        if (process.env.USER_SERVICE_FIRST_USER_EMAIL !== undefined) {
            config.firstUserEmail = process.env.USER_SERVICE_FIRST_USER_EMAIL;
        }
        if (process.env.USER_SERVICE_FIRST_USER_PASSWORD !== undefined) {
            config.firstUserPassword = process.env.USER_SERVICE_FIRST_USER_PASSWORD;
        }
        if (
            process.env.USER_SERVICE_FIRST_USER_ROLE_DISPLAY_NAME !== undefined
        ) {
            config.firstUserRoleDisplayName = process.env.USER_SERVICE_FIRST_USER_ROLE_DISPLAY_NAME;
        }
        if (
            process.env.USER_SERVICE_FIRST_USER_ROLE_DESCRIPTION !== undefined
        ) {
            config.firstUserRoleDescription = process.env.USER_SERVICE_FIRST_USER_ROLE_DESCRIPTION;
        }
        if (
            process.env.USER_SERVICE_FIRST_USER_PERMISSION_PERMISSION_NAME_LIST
        ) {
            config.firstUserPermissionPermissionNameList =
                process.env.USER_SERVICE_FIRST_USER_PERMISSION_PERMISSION_NAME_LIST.split(
                    ","
                );
        }
        return config;
    }
}

export const APPLICATION_CONFIG_TOKEN = token<ApplicationConfig>("ApplicationConfig");
