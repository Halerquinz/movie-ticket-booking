import { injected, token } from "brandi";
import { STRIPE_CONFIG_TOKEN, StripeConfig } from "../config";
import Stripe from "stripe";

export function getInstanceStripe(config: StripeConfig): Stripe {
    return new Stripe(config.apiKey);
}

injected(getInstanceStripe, STRIPE_CONFIG_TOKEN);

export const STRIPE_INSTANCE_TOKEN = token<Stripe>("Stripe");