package consumers

import (
	"NotificationService/internal/dataaccess/kafka/consumer"
	"NotificationService/internal/dataaccess/kafka/producer"
	"context"
	"encoding/json"

	"go.uber.org/zap"
)

type NotificationServiceKafkaConsumer interface {
	Start(ctx context.Context) error
}

type notificationServiceKafkaConsumer struct {
	notificationCreatedHandler  NotificationCreatedMessageHandler
	paymentTransactionCompleted PaymentTransactionCompletedMessageHandler
	kafkaConsumer               consumer.Consumer
	logger                      *zap.Logger
}

func NewNotificationServiceKafkaConsumer(
	notificationCreatedHandler NotificationCreatedMessageHandler,
	paymentTransactionCompleted PaymentTransactionCompletedMessageHandler,
	kafkaConsumer consumer.Consumer,
	logger *zap.Logger,
) NotificationServiceKafkaConsumer {
	return &notificationServiceKafkaConsumer{
		notificationCreatedHandler:  notificationCreatedHandler,
		paymentTransactionCompleted: paymentTransactionCompleted,
		kafkaConsumer:               kafkaConsumer,
		logger:                      logger,
	}
}

func (n notificationServiceKafkaConsumer) Start(ctx context.Context) error {
	// notification_created
	n.kafkaConsumer.RegisterHandler(
		producer.TopicNameNotificationServiceNotificationCreated,
		func(ctx context.Context, queueName string, payload []byte) error {
			var event producer.NotificationCreated
			if err := json.Unmarshal(payload, &event); err != nil {
				return err
			}

			return n.notificationCreatedHandler.Handle(ctx, event)
		},
	)

	// payment_transaction_completed
	n.kafkaConsumer.RegisterHandler(
		TopicNamePaymentServicePaymentTransactionCompleted,
		func(ctx context.Context, queueName string, payload []byte) error {
			var event PaymentTransactionCompleted
			if err := json.Unmarshal(payload, &event); err != nil {
				return err
			}

			return n.paymentTransactionCompleted.Handle(ctx, event)
		},
	)

	return n.kafkaConsumer.Start(ctx)
}
