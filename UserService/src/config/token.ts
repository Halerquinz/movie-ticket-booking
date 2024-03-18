import { token } from "brandi";

export class TokenConfig {
    public jwtExpireTime = "7d";
    public jwtRenewTime = "1d";

    public static fromEnv(): TokenConfig {
        const config = new TokenConfig();
        if (process.env.JWT_EXPIRE_TIME !== undefined) {
            config.jwtExpireTime = process.env.JWT_EXPIRE_TIME;
        }
        if (process.env.JWT_RENEW_TIME !== undefined) {
            config.jwtRenewTime = process.env.JWT_RENEW_TIME;
        }
        return config;
    }
}

export const TOKEN_CONFIG_TOKEN = token<TokenConfig>("TokenConfig");
