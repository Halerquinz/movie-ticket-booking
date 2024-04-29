import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import Stripe from "stripe";
import { Logger } from "winston";
import { STRIPE_CONFIG_TOKEN, StripeConfig } from "../config";
import { ErrorWithStatus, LOGGER_TOKEN } from "../utils";
import { STRIPE_INSTANCE_TOKEN } from "./stripe";

export class PaymentTransactionDetail {
    constructor(
        public paymentTransactionId: number,
        public userId: number,
        public bookingId: number,
        public amount: number,
        public theaterName: string,
        public screenName: string,
        public seatNo: string,
        public movieTitle: string,
        public showtimeStartDate: number,
        public showtimeEndDate: number,
        public expireAt: number
    ) { }
}

export interface CheckoutSessionHandler {
    createCheckoutSession(paymentTransactionDetail: PaymentTransactionDetail): Promise<{ id: string, url: string } | null>;
    cancelCheckoutSession(checkoutSessionId: string): Promise<void>;
    constructEvent(payload: Buffer, signature: string): Stripe.Event;
}

export class CheckoutSessionHandlerImpl implements CheckoutSessionHandler {
    constructor(
        private readonly logger: Logger,
        private readonly stripe: Stripe,
        private readonly stripeConfig: StripeConfig
    ) { }

    public async createCheckoutSession(paymentTransactionDetail: PaymentTransactionDetail): Promise<{ id: string, url: string } | null> {
        let checkoutSession: Stripe.Response<Stripe.Checkout.Session>;
        try {
            checkoutSession = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'vnd',
                        product_data: {
                            name: 'Đặt vé xem phim',
                            images: ["https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/p/o/poster_dune_2_bb_3_no_qr_1_.jpg"],
                            description: `Tên phim: ${paymentTransactionDetail.movieTitle} || Ghế: ${paymentTransactionDetail.seatNo} || Ngày: ${this.unixTimeToDateTime(paymentTransactionDetail.showtimeStartDate)} || Rạp: ${paymentTransactionDetail.theaterName} || Phòng: ${paymentTransactionDetail.screenName} `,
                        },
                        unit_amount: paymentTransactionDetail.amount,
                    },
                    quantity: 1,
                }],
                metadata: {
                    transaction_id: paymentTransactionDetail.paymentTransactionId,
                    user_id: paymentTransactionDetail.userId,
                    booking_id: paymentTransactionDetail.bookingId
                },
                mode: 'payment',
                expires_at: this.msToSecond(paymentTransactionDetail.expireAt),
                success_url: 'https://www.facebook.com/',
                cancel_url: 'https://www.instagram.com/'
            });
        } catch (error) {
            this.logger.error("failed to create checkout session with stripe", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (checkoutSession.url === null) {
            this.logger.error("failed to get checkoutSession.url", { payload: paymentTransactionDetail });
            return null;
        }

        return {
            id: checkoutSession.id,
            url: checkoutSession.url
        }
    }

    public async cancelCheckoutSession(checkoutSessionId: string): Promise<void> {
        try {
            await this.stripe.checkout.sessions.expire(checkoutSessionId);
        } catch (error) {
            this.logger.error("failed to cancel checkout session", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public constructEvent(payload: Buffer, signature: string): Stripe.Event {
        try {
            return this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.stripeConfig.webHookEndpointSecret
            );
        } catch (error) {
            this.logger.error("failed to constructor event", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);;
        }
    }

    private msToSecond(timestamp: number): number {
        return Math.round(timestamp / 1000);
    }

    private unixTimeToDateTime(timestamp: number): string {
        return new Date(timestamp).toString();
    }
}

injected(CheckoutSessionHandlerImpl, LOGGER_TOKEN, STRIPE_INSTANCE_TOKEN, STRIPE_CONFIG_TOKEN);

export const CHECKOUT_SESSION_HANDLER_TOKEN = token<CheckoutSessionHandler>("CheckoutSessionHandler");