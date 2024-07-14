package consumers

import (
	"NotificationService/internal/generated/payment_service"
	"NotificationService/internal/logic"
	"context"

	"go.uber.org/zap"
)

const (
	TopicNamePaymentServicePaymentTransactionCompleted = "payment_service_payment_transaction_completed"
)

type PaymentTransactionCompleted struct {
	OfBookingId              uint32                                          `json:"ofBookingId"`
	PaymentTransactionStatus payment_service.PaymentTransactionStatus_Values `json:"paymentTransactionStatus"`
}

type PaymentTransactionCompletedMessageHandler interface {
	Handle(ctx context.Context, event PaymentTransactionCompleted) error
}

type paymentTransactionCompletedMessageHandler struct {
	notificationLogic logic.NotificationLogic
	logger            *zap.Logger
}

func NewPaymentTransactionCompletedMessageHandler(
	notificationLogic logic.NotificationLogic,
	logger *zap.Logger,
) PaymentTransactionCompletedMessageHandler {
	return &paymentTransactionCompletedMessageHandler{
		notificationLogic: notificationLogic,
		logger:            logger,
	}
}

func (p paymentTransactionCompletedMessageHandler) Handle(ctx context.Context, event PaymentTransactionCompleted) error {
	logger := p.logger.With(zap.Any("event", event))
	logger.Info("payment transaction completed event received")

	if err := p.notificationLogic.CreateNotification(ctx, event.OfBookingId); err != nil {
		logger.With(zap.Error(err)).Error("failed to handle payment transaction completed event")
		return err
	}

	return nil
}
