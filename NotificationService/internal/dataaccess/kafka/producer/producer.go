package producer

import (
	"NotificationService/internal/configs"
	"NotificationService/internal/utils"
	"context"
	"fmt"

	"github.com/IBM/sarama"
	"go.uber.org/zap"
)

type Producer interface {
	Produce(ctx context.Context, queueName string, payload []byte) error
}

func newSaramaProducerConfig(kafkaConfig configs.Kafka) *sarama.Config {
	config := sarama.NewConfig()
	config.Producer.Retry.Max = 1
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Return.Successes = true
	config.ClientID = kafkaConfig.ClientID
	config.Metadata.Full = true
	return config
}

func NewProducer(
	kafkaConfig configs.Kafka,
	logger *zap.Logger,
) (Producer, error) {
	saramaSyncProducer, err := sarama.NewSyncProducer(kafkaConfig.Addresses, newSaramaProducerConfig(kafkaConfig))
	if err != nil {
		return nil, fmt.Errorf("failed to create sarama sync producer: %w", err)
	}

	return &producer{
		saramaSyncProducer: saramaSyncProducer,
		logger:             logger,
	}, nil
}

type producer struct {
	saramaSyncProducer sarama.SyncProducer
	logger             *zap.Logger
}

func (p producer) Produce(ctx context.Context, queueName string, payload []byte) error {
	logger := utils.LoggerWithContext(ctx, p.logger).
		With(zap.String("queue_name", queueName)).
		With(zap.ByteString("payload", payload))

	_, _, err := p.saramaSyncProducer.SendMessage(&sarama.ProducerMessage{
		Topic: queueName,
		Value: sarama.ByteEncoder(payload),
	})
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to produce message")
		return err
	}

	return nil
}
