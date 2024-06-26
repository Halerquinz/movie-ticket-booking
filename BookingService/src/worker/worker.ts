import { injected, token } from "brandi";
import { Logger } from "winston";
import { QueueNameCheckBookingStatusAfterInitialize } from "../dataaccess/bull";
import { BullWorker, WORKER_TOKEN } from "../dataaccess/bull/worker/worker";
import { BOOKING_OPERATOR_TOKEN, BookingOperator } from "../module/booking";
import { LOGGER_TOKEN } from "../utils";

export class BookingServiceWorker {
    constructor(
        private readonly worker: BullWorker,
        private readonly bookingOperator: BookingOperator,
        private readonly logger: Logger
    ) { }

    public start(): void {
        this.worker
            .registerHandlerListAndStart([
                {
                    topic: QueueNameCheckBookingStatusAfterInitialize,
                    onProcess: (job: any) => {
                        return this.bookingOperator.checkBookingStatusAfterInitialize(job.data.bookingId);
                    }
                },
            ])
            .then(() => {
                if (process.send) {
                    process.send("ready");
                }
            });

        this.logger.info("worker started");
    }
}

injected(
    BookingServiceWorker,
    WORKER_TOKEN,
    BOOKING_OPERATOR_TOKEN,
    LOGGER_TOKEN
);

export const BOOKING_SERVICE_WORKER_TOKEN =
    token<BookingServiceWorker>("BookingServiceWorker");