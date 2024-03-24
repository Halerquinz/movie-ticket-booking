import { injected, token } from "brandi";
import { Logger } from "winston";
import { TOKEN_MANAGEMENT_OPERATOR_TOKEN, TokenManagementOperator } from "../module/token";
import { LOGGER_TOKEN, TIMER_TOKEN, Timer } from "../utils";

export interface DeleteExpiredBlacklistedTokenJob {
    execute(): Promise<void>;
}

export class DeleteExpiredBlacklistedTokenJobImpl implements DeleteExpiredBlacklistedTokenJob {
    constructor(
        private readonly tokenManagementOperator: TokenManagementOperator,
        private readonly timer: Timer,
        private readonly logger: Logger
    ) { }

    public async execute(): Promise<void> {
        await this.tokenManagementOperator.deleteExpiredBlacklistedToken(this.timer.getCurrentTime());
        this.logger.info("Deleted expired blacklisted token successfully");
    }
}

injected(DeleteExpiredBlacklistedTokenJobImpl, TOKEN_MANAGEMENT_OPERATOR_TOKEN, TIMER_TOKEN, LOGGER_TOKEN);

export const DELETE_EXPIRED_BLACKLISTED_TOKEN_JOB_TOKEN = token<DeleteExpiredBlacklistedTokenJob>(
    "DeleteExpiredBlacklistedTokenJob"
);
