import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import ms from "ms";
import { Logger } from "winston";
import { APPLICATION_CONFIG_TOKEN, ApplicationConfig } from "../../config";
import {
    CHECKOUT_SESSION_DATA_ACCESSOR_TOKEN,
    CheckoutSessionDataAccessor,
    PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN,
    PaymentTransactionDataAccessor,
    PaymentTransactionStatus
} from "../../dataaccess/db";
import { BOOKING_SERVICE_DM_TOKEN, MOVIE_SERVICE_DM_TOKEN } from "../../dataaccess/grpc";
import { CHECKOUT_OPERATOR_TOKEN, CheckoutOperator, PaymentTransactionDetail } from "../../payment-service-provider";
import { BookingServiceClient } from "../../proto/gen/BookingService";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ErrorWithStatus, LOGGER_TOKEN, TIMER_TOKEN, Timer, promisifyGRPCCall } from "../../utils";
import { Booking, BookingStatus, Movie, Screen, Seat, Showtime, Theater } from "./payment_transaction_detail_models";

export interface PaymentTransactionManagementOperator {
    createPaymentTransaction(bookingId: number, userId: number): Promise<string>;
    cancelPaymentTransaction(bookingId: number, userId: number): Promise<void>;
}

export class PaymentTransactionManagementOperatorImpl implements PaymentTransactionManagementOperator {
    constructor(
        private readonly paymentTransactionDM: PaymentTransactionDataAccessor,
        private readonly logger: Logger,
        private readonly timer: Timer,
        private readonly checkoutOperator: CheckoutOperator,
        private readonly applicationConfig: ApplicationConfig,
        private readonly checkoutSessionDM: CheckoutSessionDataAccessor,
        private readonly movieServiceDM: MovieServiceClient,
        private readonly bookingServiceDM: BookingServiceClient,
    ) { }

    public async createPaymentTransaction(bookingId: number, userId: number): Promise<string> {
        const dmResults = await Promise.all([
            this.getBookingWithStatus(bookingId, userId, BookingStatus.INITIALIZING),
            this.paymentTransactionDM.getPaymentTransactionByBookingIdWithStatusPending(bookingId)
        ]);
        const booking = dmResults[0];
        const paymentTransaction = dmResults[1];

        if (booking === null) {
            if (paymentTransaction === null) {
                this.logger.error("no booking with booking_id found", { ofBookingId: bookingId });
                throw new ErrorWithStatus(`no booking with booking_id=${bookingId}`, status.NOT_FOUND);
            }

            const checkoutSession = await this.checkoutSessionDM.getCheckoutSession(paymentTransaction.id);
            if (checkoutSession === null) {
                this.logger.error("no checkout session with payment_transaction_id found", { paymentTransactionId: paymentTransaction.id });
                throw new ErrorWithStatus(`no checkout session with payment_transaction_id=${paymentTransaction.id}`, status.NOT_FOUND);
            }
            return checkoutSession.url;
        }

        const showtime = await this.getShowtime(booking.ofShowtimeId);
        if (showtime === null) {
            this.logger.error("no showtime with showtime_id found", { showtimeId: booking.ofShowtimeId });
            throw new ErrorWithStatus(`no showtime with showtime_id=${booking.ofShowtimeId}`, status.NOT_FOUND);
        }

        const movie = await this.getMovie(showtime.ofMovieId);
        if (movie === null) {
            this.logger.error("no movie with movie_id found", { movieId: showtime.ofMovieId });
            throw new ErrorWithStatus(`no movie with movie_id=${showtime.ofMovieId}`, status.NOT_FOUND);
        }

        const seat = await this.getSeat(booking.ofSeatId);
        if (seat === null) {
            this.logger.error("no seat with seat_id found", { seatId: booking.ofSeatId });
            throw new ErrorWithStatus(`no seat with seat_id=${booking.ofSeatId}`, status.NOT_FOUND);
        }

        const screen = await this.getScreen(seat.ofScreenId);
        if (screen === null) {
            this.logger.error("no screen with screen_id found", { screenId: seat.ofScreenId });
            throw new ErrorWithStatus(`no screen with screen_id=${seat.ofScreenId}`, status.NOT_FOUND);
        }

        const theater = await this.getTheater(screen.ofTheaterId);
        if (theater === null) {
            this.logger.error("no theater with theater_id found", { theaterId: screen.ofTheaterId });
            throw new ErrorWithStatus(`no theater with theater_id=${screen.ofTheaterId}`, status.NOT_FOUND);
        }

        const { error: getBookingError } = await promisifyGRPCCall(
            this.bookingServiceDM.updateBookingStatusFromInitializingToPending.bind(this.bookingServiceDM), { bookingId });
        if (getBookingError !== null) {
            if (getBookingError.code === status.FAILED_PRECONDITION) {
                this.logger.error(getBookingError.message, { error: getBookingError.details });
                throw new ErrorWithStatus(getBookingError.message, status.FAILED_PRECONDITION);
            }

            this.logger.error("failed to call booking.getBooking()", { error: getBookingError });
            throw new ErrorWithStatus("failed to get booking", status.INTERNAL);
        }

        const requestTime = this.timer.getCurrentTime();
        const expireAt = requestTime + ms(this.applicationConfig.checkoutTime);

        const pendingPaymentTransactionCount =
            await this.paymentTransactionDM.countPendingPaymentTransaction(bookingId);
        if (pendingPaymentTransactionCount > 0) {
            this.logger.error("there are existing pending payment transaction for booking", { ofBookingId: bookingId });
            throw new ErrorWithStatus("there are existing pending payment transaction for booking", status.ALREADY_EXISTS);
        }

        const paymentTransactionId = await this.paymentTransactionDM.createPaymentTransaction(
            bookingId,
            requestTime,
            PaymentTransactionStatus.PENDING
        );

        const { id: checkoutSessionId, url } = await this.checkoutOperator.onCreatePaymentTransaction(
            new PaymentTransactionDetail(
                paymentTransactionId,
                userId,
                bookingId,
                booking.amount,
                booking.currency,
                theater.displayName,
                screen.displayName,
                seat.no,
                movie.title,
                showtime.timeStart,
                showtime.timeEnd,
                expireAt
            ));

        await this.checkoutSessionDM.createCheckoutSession(paymentTransactionId, url, checkoutSessionId);

        return url;
    }

    public async cancelPaymentTransaction(bookingId: number, userId: number): Promise<void> {
        const booking = this.getBookingWithStatus(bookingId, userId, BookingStatus.PENDING);
        if (booking === null) {
            this.logger.error("can not find booking with bookingId with status pending", { bookingId: bookingId });
            throw new ErrorWithStatus(`can not find booking with bookingId with status pending`, status.NOT_FOUND);
        }

        const paymentTransaction = await this.paymentTransactionDM.getPaymentTransactionByBookingIdWithXLock(bookingId);
        if (paymentTransaction === null) {
            this.logger.error("can not find payment transaction with bookingId", { bookingId: bookingId });
            throw new ErrorWithStatus(`can not find payment transaction with bookingId`, status.INVALID_ARGUMENT);
        }

        const checkoutSession = await this.checkoutSessionDM.getCheckoutSession(paymentTransaction.id);
        if (checkoutSession === null) {
            this.logger.error("can not find payment transaction with paymentTransactionId", { paymentTransactionId: paymentTransaction.id });
            throw new ErrorWithStatus(`can not find payment transaction with paymentTransactionID`, status.NOT_FOUND);
        }

        await this.checkoutOperator.onCancelPaymentTransaction(checkoutSession.checkoutSessionId);
    }

    private async getBookingWithStatus(bookingId: number, userId: number, bookingStatus: BookingStatus): Promise<Booking | null> {
        const { error: getBookingError, response: getBookingResponse } = await promisifyGRPCCall(
            this.bookingServiceDM.getBookingWithStatus.bind(this.bookingServiceDM),
            { bookingId, bookingStatus: bookingStatus as any, userId: userId }
        );
        if (getBookingError !== null) {
            if (getBookingError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call booking.getBooking()", { error: getBookingError });
            throw new ErrorWithStatus("failed to get booking", status.INTERNAL);
        }

        return Booking.fromProto(getBookingResponse?.booking);
    }

    private async getShowtime(showtimeId: number): Promise<Showtime | null> {
        const { error: getShowtimeError, response: getShowtimeResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getShowtime.bind(this.movieServiceDM), { showtimeId });
        if (getShowtimeError !== null) {
            if (getShowtimeError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getShowtime()", { error: getShowtimeError });
            throw new ErrorWithStatus("failed to get showtime", status.INTERNAL);
        }

        return Showtime.fromProto(getShowtimeResponse?.showtime);
    }

    private async getMovie(movieId: number): Promise<Movie | null> {
        const { error: getMovieError, response: getMovieResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getMovie.bind(this.movieServiceDM), { id: movieId });
        if (getMovieError !== null) {
            if (getMovieError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getMovie()", { error: getMovieError });
            throw new ErrorWithStatus("failed to get Movie", status.INTERNAL);
        }

        return Movie.fromProto(getMovieResponse?.movie);
    }

    private async getSeat(seatId: number): Promise<Seat | null> {
        const { error: getSeatError, response: getSeatResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getSeat.bind(this.movieServiceDM), { seatId });
        if (getSeatError !== null) {
            if (getSeatError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getSeat()", { error: getSeatError });
            throw new ErrorWithStatus("failed to get Seat", status.INTERNAL);
        }

        return Seat.fromProto(getSeatResponse?.seat);
    }

    private async getScreen(screenId: number): Promise<Screen | null> {
        const { error: getScreenError, response: getScreenResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getScreen.bind(this.movieServiceDM), { screenId });
        if (getScreenError !== null) {
            if (getScreenError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getScreen()", { error: getScreenError });
            throw new ErrorWithStatus("failed to get Screen", status.INTERNAL);
        }

        return Screen.fromProto(getScreenResponse?.screen);
    }

    private async getTheater(theaterId: number): Promise<Theater | null> {
        const { error: getTheaterError, response: getTheaterResponse } = await promisifyGRPCCall(
            this.movieServiceDM.getTheater.bind(this.movieServiceDM), { theaterId: theaterId });
        if (getTheaterError !== null) {
            if (getTheaterError.code === status.NOT_FOUND) {
                return null;
            }

            this.logger.error("failed to call movie.getTheater()", { error: getTheaterError });
            throw new ErrorWithStatus("failed to get Theater", status.INTERNAL);
        }

        return Theater.fromProto(getTheaterResponse?.theater);
    }
}

injected(
    PaymentTransactionManagementOperatorImpl,
    PAYMENT_TRANSACTION_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN,
    TIMER_TOKEN,
    CHECKOUT_OPERATOR_TOKEN,
    APPLICATION_CONFIG_TOKEN,
    CHECKOUT_SESSION_DATA_ACCESSOR_TOKEN,
    MOVIE_SERVICE_DM_TOKEN,
    BOOKING_SERVICE_DM_TOKEN,
);

export const PAYMENT_TRANSACTION_MANAGEMENT_OPERATOR_TOKEN =
    token<PaymentTransactionManagementOperator>("PaymentTransactionManagementOperator");