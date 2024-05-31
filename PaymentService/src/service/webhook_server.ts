import { injected, token } from "brandi";
import express from "express";
import { Logger } from "winston";
import { STRIPE_CONFIG_TOKEN, StripeConfig } from "../config";
import { CHECKOUT_OPERATOR_TOKEN, CheckoutOperator } from "../payment-service-provider";
import { LOGGER_TOKEN } from "../utils";

export class WebhookHTTPServer {
    constructor(
        private readonly logger: Logger,
        private readonly stripeConfig: StripeConfig,
        private readonly checkoutOperator: CheckoutOperator
    ) { }

    public start(): void {
        const server = this.getWebhookHTTPServer();
        server.listen(this.stripeConfig.port, () => {
            console.log(`server webhook http is listening on port ${this.stripeConfig.port} `);
            this.logger.info("started webhook http server", {
                port: this.stripeConfig.port,
            });
        });
    }

    private getWebhookHTTPServer(): express.Express {
        const server = express();
        server.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
            const signature = req.headers['stripe-signature'] as string;
            await this.checkoutOperator.onPaymentThirdPartyResponse(req.body, signature);
        });
        return server;
    }
}

injected(
    WebhookHTTPServer,
    LOGGER_TOKEN,
    STRIPE_CONFIG_TOKEN,
    CHECKOUT_OPERATOR_TOKEN
);

export const WEBHOOK_HTTP_SERVER_TOKEN = token<WebhookHTTPServer>("WebhookHTTPServer");

