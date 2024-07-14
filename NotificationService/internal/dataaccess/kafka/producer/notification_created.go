package producer

import (
	"NotificationService/internal/utils"
	"context"
	"encoding/json"

	"go.uber.org/zap"
)

const (
	TopicNameNotificationServiceNotificationCreated = "notification_service_notification_created"
)

type NotificationCreated struct {
	ID uint32 `json:"id"`
}

type NotificationCreatedProducer interface {
	Produce(ctx context.Context, event NotificationCreated) error
}

func NewNotificationCreatedProducer(
	producer Producer,
	logger *zap.Logger,
) NotificationCreatedProducer {
	return &notificationCreated{
		producer: producer,
		logger:   logger,
	}
}

type notificationCreated struct {
	producer Producer
	logger   *zap.Logger
}

func (n notificationCreated) Produce(ctx context.Context, event NotificationCreated) error {
	logger := utils.LoggerWithContext(ctx, n.logger)

	eventBytes, err := json.Marshal(event)
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to marshal notification created event")
		return err
	}

	err = n.producer.Produce(ctx, TopicNameNotificationServiceNotificationCreated, eventBytes)
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to produce notification task created event")
		return err
	}

	return nil
}
