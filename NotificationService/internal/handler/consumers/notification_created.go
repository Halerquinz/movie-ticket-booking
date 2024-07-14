package consumers

import (
	"NotificationService/internal/dataaccess/kafka/producer"
	"NotificationService/internal/logic"
	"context"

	"go.uber.org/zap"
)

type NotificationCreatedMessageHandler interface {
	Handle(ctx context.Context, event producer.NotificationCreated) error
}

type notificationCreatedMessageHandler struct {
	notificationLogic logic.NotificationLogic
	logger            *zap.Logger
}

func NewNotificationCreatedMessageHandler(
	notificationLogic logic.NotificationLogic,
	logger *zap.Logger,
) NotificationCreatedMessageHandler {
	return &notificationCreatedMessageHandler{
		notificationLogic: notificationLogic,
		logger:            logger,
	}
}

func (n notificationCreatedMessageHandler) Handle(ctx context.Context, event producer.NotificationCreated) error {
	logger := n.logger.With(zap.Any("event", event))
	logger.Info("notification created event received")

	if err := n.notificationLogic.GeneratePDFAndSendEmail(ctx, event.ID); err != nil {
		logger.With(zap.Error(err)).Error("failed to handle notification created event")
		return err
	}

	return nil
}
