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

const (
	HeaderText                 = "Movie Ticket Booking Invoice!"
	BodyTextWhenPaymentSuccess = "Payment transaction successfully, here is the attached PDF."
	BodyTextWhenPaymentFailed  = "Payment transaction failed please retry if you need!!"
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

func NewMailer(config configs.Mail, logger *zap.Logger, s3DM s3.Client) Mailer {
	return &mailer{
		config: config,
		logger: logger,
		s3DM:   s3DM,
	}
}

func (m *mailer) Send(
	ctx context.Context,
	user *user_service.User,
	booking *booking_service.Booking,
	notification *database.Notification,
) error {
	logger := m.logger.With(zap.Any("send mail", notification.ID))
	d := gomail.NewDialer("smtp.gmail.com", 587, m.config.HostEmail, m.config.HostEmailAppPassword)

	mail := gomail.NewMessage()
	mail.SetHeader("From", m.config.HostEmail)
	mail.SetHeader("To", user.Email)
	mail.SetHeader("Subject", HeaderText)

	// Set body text based on booking status
	bodyText := BodyTextWhenPaymentSuccess
	if booking.BookingStatus == booking_service.BookingStatus_CANCEL {
		bodyText = BodyTextWhenPaymentFailed
	}
	mail.SetBody("text/html", bodyText)

	var tmpfile *os.File
	if booking.BookingStatus != booking_service.BookingStatus_CANCEL {
		var err error
		tmpfile, err = m.attachPDF(ctx, mail, notification)
		if err != nil {
			return err
		}
		defer tmpfile.Close()
		defer os.Remove(tmpfile.Name())
	}

	if err := d.DialAndSend(mail); err != nil {
		logger.With(zap.Error(err)).Error("failed to send email")
		return err
	}

	return nil
}

func (m *mailer) attachPDF(ctx context.Context, mail *gomail.Message, notification *database.Notification) (*os.File, error) {
	pdfData, err := m.s3DM.GetFile(ctx, notification.OriginalPDFFilename)
	if err != nil {
		m.logger.With(zap.Error(err)).Error("failed to get PDF file")
		return nil, err
	}

	tmpfile, err := os.CreateTemp("", "attachment-*.pdf")
	if err != nil {
		m.logger.With(zap.Error(err)).Error("failed to create temp file")
		return nil, err
	}

	if _, err := tmpfile.Write(pdfData); err != nil {
		tmpfile.Close()
		os.Remove(tmpfile.Name())
		m.logger.With(zap.Error(err)).Error("failed to write to temp file")
		return nil, err
	}

	mail.Attach(tmpfile.Name())

	return tmpfile, nil
}
