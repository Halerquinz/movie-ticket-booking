package logic

import (
	"NotificationService/internal/configs"
	"NotificationService/internal/dataaccess/database"
	"NotificationService/internal/dataaccess/s3"
	"NotificationService/internal/generated/booking_service"
	"NotificationService/internal/generated/user_service"
	"context"
	"os"

	"go.uber.org/zap"
	"gopkg.in/gomail.v2"
)

type Mailer interface {
	Send(
		ctx context.Context,
		user *user_service.User,
		booking *booking_service.Booking,
		notification *database.Notification,
	) error
}

type mailer struct {
	config configs.Mail
	logger *zap.Logger
	s3DM   s3.Client
}

func NewMailer(
	config configs.Mail,
	logger *zap.Logger,
	s3DM s3.Client,
) Mailer {
	return &mailer{
		config: config,
		logger: logger,
		s3DM:   s3DM,
	}
}

func (m mailer) Send(
	ctx context.Context,
	user *user_service.User,
	booking *booking_service.Booking,
	notification *database.Notification,
) error {
	logger := m.logger.With(zap.Any("send mail", notification.ID))

	pdfData, err := m.s3DM.GetFile(ctx, notification.OriginalPDFFilename)
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to get PDF file")
		return err
	}

	// Create a temporary file
	tmpfile, err := os.CreateTemp("", "attachment-*.pdf")
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to create temp file")
		return err
	}
	defer tmpfile.Close()
	defer os.Remove(tmpfile.Name())

	// Write data to the temporary file
	if _, err := tmpfile.Write(pdfData); err != nil {
		tmpfile.Close()
		logger.With(zap.Error(err)).Error("failed to write to temp file")
	}

	mail := gomail.NewMessage()
	mail.SetHeader("From", m.config.HostEmail)
	mail.SetHeader("To", user.Email)
	mail.SetHeader("Subject", "Movie Ticket Booking Invoice!")
	mail.SetBody("text/html", "Here is the attached PDF.")

	mail.Attach(tmpfile.Name())

	d := gomail.NewDialer("smtp.gmail.com", 587, m.config.HostEmail, m.config.HostEmailAppPassword)

	if err := d.DialAndSend(mail); err != nil {
		logger.With(zap.Error(err)).Error("failed to send email")
		return err
	}

	return nil
}
