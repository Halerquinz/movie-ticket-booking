package logic

import (
	"NotificationService/internal/dataaccess/database"
	"NotificationService/internal/dataaccess/kafka/producer"
	"NotificationService/internal/dataaccess/s3"
	"NotificationService/internal/generated/booking_service"
	"NotificationService/internal/generated/movie_service"
	"NotificationService/internal/generated/user_service"
	pdfgenerator "NotificationService/internal/handler/pdf_generator"
	"context"
	"fmt"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type NotificationLogic interface {
	CreateNotification(ctx context.Context, bookingId uint32) error
	GeneratePDFAndSendEmail(ctx context.Context, bookingId uint32) error
}

type notificationLogic struct {
	notificationDataAccessor    database.NotificationDataAccessor
	pdfGenerator                pdfgenerator.PDFGenerator
	mailer                      Mailer
	s3DM                        s3.Client
	notificationCreatedProducer producer.NotificationCreatedProducer
	logger                      *zap.Logger
	db                          *gorm.DB
	userServiceClient           user_service.UserServiceClient
	movieSerServiceClient       movie_service.MovieServiceClient
	bookingSerServiceClient     booking_service.BookingServiceClient
}

func NewNotificationLogic(
	notificationDataAccessor database.NotificationDataAccessor,
	pdfGenerator pdfgenerator.PDFGenerator,
	mailer Mailer,
	s3DM s3.Client,
	notificationCreatedProducer producer.NotificationCreatedProducer,
	logger *zap.Logger,
	db *gorm.DB,
	userServiceClient user_service.UserServiceClient,
	movieSerServiceClient movie_service.MovieServiceClient,
	bookingSerServiceClient booking_service.BookingServiceClient,
) NotificationLogic {
	return &notificationLogic{
		notificationDataAccessor:    notificationDataAccessor,
		pdfGenerator:                pdfGenerator,
		mailer:                      mailer,
		s3DM:                        s3DM,
		notificationCreatedProducer: notificationCreatedProducer,
		logger:                      logger,
		db:                          db,
		userServiceClient:           userServiceClient,
		movieSerServiceClient:       movieSerServiceClient,
		bookingSerServiceClient:     bookingSerServiceClient,
	}
}

func (n *notificationLogic) CreateNotification(ctx context.Context, bookingId uint32) error {
	logger := n.logger.With(zap.Any("create_notification_with_booking_id", bookingId))

	notification := database.Notification{
		OfBookingId:         bookingId,
		OriginalPDFFilename: "",
		Status:              database.NotificationStatus_NOTIFICATION_STATUS_PENDING,
	}

	return n.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		notificationCount, err := n.notificationDataAccessor.WithDB(tx).GetNotificationCount(ctx, bookingId)
		if err != nil {
			return err
		}
		if notificationCount > 0 {
			logger.With(zap.Error(err)).Error("there is notification with booking_id in the database, will not create notification")
			return fmt.Errorf("notification already exists for booking ID: %d", bookingId)
		}

		if err := tx.Create(&notification).Error; err != nil {
			return err
		}

		if err := n.notificationCreatedProducer.Produce(
			ctx,
			producer.NotificationCreated{ID: notification.OfBookingId},
		); err != nil {
			return err
		}

		return nil
	})
}

func (n notificationLogic) GeneratePDFAndSendEmail(ctx context.Context, notificationId uint32) error {
	logger := n.logger.With(zap.Any("generate_pdf_and_send_email", notificationId))

	updated, notification, err := n.updateNotificationFromPendingToProcessing(ctx, notificationId)
	if err != nil {
		return err
	}
	if !updated {
		return nil
	}

	booking, err := n.getBooking(ctx, notification.OfBookingId)
	if err != nil {
		return err
	}

	user, err := n.getUser(ctx, booking.OfUserId)
	if err != nil {
		return err
	}

	switch booking.BookingStatus {
	case booking_service.BookingStatus_CANCEL:
		notification.Status = database.NotificationStatus_NOTIFICATION_STATUS_SUCCESS
		_, err = n.notificationDataAccessor.UpdateNotification(ctx, notification)
		if err != nil {
			return err
		}
	case booking_service.BookingStatus_CONFIRMED:
		originalPDFFilename, err := n.genPDF(ctx, &booking, &user)
		if err != nil {
			return err
		}
		notification.Status = database.NotificationStatus_NOTIFICATION_STATUS_SUCCESS
		notification.OriginalPDFFilename = originalPDFFilename
		_, err = n.notificationDataAccessor.UpdateNotification(ctx, notification)
		if err != nil {
			return err
		}
	default:
		logger.With(zap.Any("booking_status", booking.BookingStatus)).Error("unsupported booking status")
		notification.Status = database.NotificationStatus_NOTIFICATION_STATUS_FAILED
		_, err = n.notificationDataAccessor.UpdateNotification(ctx, notification)
		if err != nil {
			return err
		}
	}

	err = n.mailer.Send(ctx, &user, &booking, notification)
	if err != nil {
		return err
	}

	return nil
}

func (n notificationLogic) updateNotificationFromPendingToProcessing(
	ctx context.Context,
	notificationId uint32,
) (bool, *database.Notification, error) {
	var (
		logger       = n.logger.With(zap.Any("update_notification_from_pending_to_processing", notificationId))
		updated      = false
		notification *database.Notification
		err          error
	)

	txErr := n.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		notification, err = n.notificationDataAccessor.WithDB(tx).GetNotificationByIdWithXLock(ctx, notificationId)
		if err != nil {
			return err
		}

		if notification.Status != database.NotificationStatus_NOTIFICATION_STATUS_PENDING {
			updated = false
			logger.Warn("notification is not in pending status, will not execute")
			return nil
		}

		notification.Status = database.NotificationStatus_NOTIFICATION_STATUS_PROCESSING
		_, err = n.notificationDataAccessor.WithDB(tx).UpdateNotification(ctx, notification)
		if err != nil {
			return err
		}

		if err := n.notificationCreatedProducer.Produce(
			ctx,
			producer.NotificationCreated{ID: notification.OfBookingId},
		); err != nil {
			return err
		}

		updated = true
		return nil
	})
	if txErr != nil {
		return false, &database.Notification{}, err
	}

	return updated, notification, nil
}

func (n notificationLogic) getUser(ctx context.Context, userId uint32) (user_service.User, error) {
	logger := n.logger.With(zap.Any("get user", userId))

	getUserResp, getUserErr := n.userServiceClient.GetUser(
		ctx,
		&user_service.GetUserRequest{Id: userId},
	)
	if getUserErr != nil {
		logger.With(zap.Error(getUserErr)).Error(getUserErr.Error())
		return user_service.User{}, getUserErr
	}

	return *getUserResp.GetUser(), nil
}

func (n notificationLogic) genPDF(
	ctx context.Context,
	booking *booking_service.Booking,
	user *user_service.User,
) (string, error) {
	originalPDFFilename := fmt.Sprintf("pdf_invoice_%d.pdf", booking.Id)

	showtimeMetadata, err := n.getShowtimeMetadata(ctx, booking.OfShowtimeId)
	if err != nil {
		return "", err
	}

	seat, err := n.getSeat(ctx, booking.OfSeatId)
	if err != nil {
		return "", err
	}

	fileData, err := n.pdfGenerator.Generate(pdfgenerator.PDFGenerateParams{
		Username:        user.Username,
		Email:           user.Email,
		Amount:          booking.Amount,
		Currency:        booking.Currency,
		MovieName:       showtimeMetadata.Movie.Title,
		SeatNo:          seat.No,
		TheaterName:     showtimeMetadata.Theater.DisplayName,
		TheaterLocation: showtimeMetadata.Theater.Location,
		ScreenName:      showtimeMetadata.Screen.DisplayName,
		TimeStart:       showtimeMetadata.Showtime.TimeStart,
		TimeEnd:         showtimeMetadata.Showtime.TimeEnd,
	})
	if err != nil {
		return "", err
	}

	if err := n.s3DM.UploadFile(ctx, originalPDFFilename, fileData); err != nil {
		return "", err
	}

	return originalPDFFilename, nil
}

func (n notificationLogic) getShowtimeMetadata(
	ctx context.Context,
	showtimeId uint32,
) (movie_service.ShowtimeMetadata, error) {
	logger := n.logger.With(zap.Any("get showtime metadata", showtimeId))

	getShowtimeMetadataResp, getShowtimeMetadataErr := n.movieSerServiceClient.GetShowtimeMetadata(
		ctx,
		&movie_service.GetShowtimeMetadataRequest{ShowtimeId: showtimeId},
	)
	if getShowtimeMetadataErr != nil {
		logger.With(zap.Error(getShowtimeMetadataErr)).Error(getShowtimeMetadataErr.Error())
		return movie_service.ShowtimeMetadata{}, getShowtimeMetadataErr
	}

	return *getShowtimeMetadataResp.GetShowtimeMetadata(), nil
}

func (n notificationLogic) getBooking(
	ctx context.Context,
	bookingId uint32,
) (booking_service.Booking, error) {
	logger := n.logger.With(zap.Any("get booking", bookingId))

	getBookingResp, getBookingErr := n.bookingSerServiceClient.GetBookingById(
		ctx,
		&booking_service.GetBookingByIdRequest{BookingId: bookingId},
	)
	if getBookingErr != nil {
		logger.With(zap.Error(getBookingErr)).Error(getBookingErr.Error())
		return booking_service.Booking{}, getBookingErr
	}

	return *getBookingResp.GetBooking(), nil
}

func (n notificationLogic) getSeat(
	ctx context.Context,
	seatId uint32,
) (movie_service.Seat, error) {
	logger := n.logger.With(zap.Any("get seat", seatId))

	getSeatResp, getSeatErr := n.movieSerServiceClient.GetSeat(
		ctx,
		&movie_service.GetSeatRequest{SeatId: seatId},
	)
	if getSeatErr != nil {
		logger.With(zap.Error(getSeatErr)).Error(getSeatErr.Error())
		return movie_service.Seat{}, getSeatErr
	}

	return *getSeatResp.GetSeat(), nil
}
