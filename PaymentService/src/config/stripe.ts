import { token } from "brandi";

export class StripeConfig {
    public apiKey = "sk_test_51P6wPQP8gU29IW1UUuoTwgIr7S53CY3B9bPXkLvOJQAhlW1XeBK95avwaX03VcR760BmvarFq4itDgmt0PCxUf6m00HQ3ObFsm";
    public webHookEndpointSecret = "whsec_b970a079b33287edad0ef78bce20cc1467f3ae2799f125b7e402d3f3fed06438";
    public port = 4242;

    public static fromEnv(): StripeConfig {
        const config = new StripeConfig();
        config.apiKey = process.env.STRIPE_API_KEY!;
        config.webHookEndpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET!;
        config.port = +process.env.STRIPE_WEBHOOK_PORT!;
        return config;
    }
}

export const STRIPE_CONFIG_TOKEN = token<StripeConfig>("StripeConfig");
