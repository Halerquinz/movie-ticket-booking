import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../../config";
import ms from "ms";
import { injected, token } from "brandi";
import { LOGGER_TOKEN } from "../../../utils";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { REDIS_INSTANCE_TOKEN } from "../redis";

export const QueueNameCheckBookingStatusAfterInitialize = "check_booking_status_after_initialize";

export interface CheckBookingStatusAfterInitializeQueue {
    addCheckBookingStatusAfterInitializeQueue(bookingId: number): Promise<void>;
}

export class CheckBookingStatusAfterInitializeQueueImpl implements CheckBookingStatusAfterInitializeQueue {
    private readonly checkBookingStatusAfterInitializeQueue: Queue;

    constructor(
        private readonly logger: Logger,
        private readonly applicationConfig: ApplicationConfig,
        private readonly redis: Redis,
    ) {
        this.checkBookingStatusAfterInitializeQueue =
            new Queue(QueueNameCheckBookingStatusAfterInitialize, { connection: this.redis });
    }

    public async addCheckBookingStatusAfterInitializeQueue(bookingId: number): Promise<void> {
        await this.checkBookingStatusAfterInitializeQueue.add(
            QueueNameCheckBookingStatusAfterInitialize,
            { bookingId: bookingId },
            {
                delay: ms(this.applicationConfig.expireTimeAfterInitializeBooking),
                attempts: 5
            }
        )

        this.logger.info(`Successfully to add CheckBookingStatusAfterInitializeQueue with booking_id=${bookingId}`);
    }
}

injected(
    CheckBookingStatusAfterInitializeQueueImpl,
    LOGGER_TOKEN,
    APPLICATION_CONFIG_TOKEN,
    REDIS_INSTANCE_TOKEN
);

export const CHECK_BOOKING_STATUS_AFTER_INITIALIZE_QUEUE_TOKEN =
    token<CheckBookingStatusAfterInitializeQueue>("CheckBookingStatusAfterInitializeQueue");