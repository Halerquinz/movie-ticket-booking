import { Logger } from "winston";
import { User } from "../../proto/gen/User";
import { UserServiceClient } from "../../proto/gen/UserService";
import { ErrorWithStatus, promisifyGRPCCall } from "../../utils";
import { status } from "@grpc/grpc-js";
import { UserInfoProvider } from "../info_providers";
import { Booking, BookingDataAccessor } from "../../dataaccess/db";

export interface BookingManagementOperator {
    createBooking(
        userId: number,
        showTimeId: number,
        listSeatId: number[]
    ): Promise<Booking>
}

export class BookingManagementOperatorImpl implements BookingManagementOperator {
    constructor(
        private readonly logger: Logger,
        private readonly userServiceDM: UserServiceClient,
        private readonly userInfoProvider: UserInfoProvider,
        private readonly bookingDM: BookingDataAccessor
    ) { }

    public async createBooking(userId: number, showTimeId: number, listSeatId: number[]): Promise<Booking> {
        const userRecord = await this.userInfoProvider.getUser(userId);
        if (userRecord === null) {
            this.logger.error("no user with user id found", { userId });
            throw new ErrorWithStatus("no user with user id found", status.INVALID_ARGUMENT);
        }

        const showTimeRecord = 

    }


}