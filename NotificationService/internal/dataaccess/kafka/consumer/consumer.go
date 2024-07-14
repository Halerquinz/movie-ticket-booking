package consumer

import (
	"NotificationService/internal/configs"
	"NotificationService/internal/utils"
	"context"
	"fmt"
	"os"
	"os/signal"
	"time"

	"github.com/IBM/sarama"
	"go.uber.org/zap"
)

type MessageHandlerFunc func(ctx context.Context, queueName string, payload []byte) error

type consumerHandler struct {
	handlerFunc       MessageHandlerFunc
	exitSignalChannel chan os.Signal
}

func newConsumerHandler(
	handlerFunc MessageHandlerFunc,
	exitSignalChannel chan os.Signal,
) *consumerHandler {
	return &consumerHandler{
		handlerFunc:       handlerFunc,
		exitSignalChannel: exitSignalChannel,
	}
}

func (h consumerHandler) Setup(sarama.ConsumerGroupSession) error {
	return nil
}

// Cleanup is run at the end of a session, once all ConsumeClaim goroutines have exited
func (h consumerHandler) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

// ConsumeClaim must start a consumer loop of ConsumerGroupClaim's Messages().
// Once the Messages() channel is closed, the Handler must finish its processing
// loop and exit.
func (h consumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for {
		select {
		case message, ok := <-claim.Messages():
			if !ok {
				session.Commit()
				return nil
			}

			if err := h.handlerFunc(session.Context(), message.Topic, message.Value); err != nil {
				return err
			}

		case <-h.exitSignalChannel:
			session.Commit()
			return nil
		}
	}
}

type Consumer interface {
	RegisterHandler(queueName string, handlerFunc MessageHandlerFunc)
	Start(ctx context.Context) error
}

type consumer struct {
	saramaConsumer            sarama.ConsumerGroup
	logger                    *zap.Logger
	queueNameToHandlerFuncMap map[string]MessageHandlerFunc
}

func newSaramaConsumerConfig(kafkaConfig configs.Kafka) *sarama.Config {
	config := sarama.NewConfig()
	config.ClientID = kafkaConfig.ClientID
	config.Metadata.Full = true
	config.Consumer.Fetch.Min = 1024 * 1024              // 1MB
	config.Consumer.MaxWaitTime = 500 * time.Millisecond // 500ms
	return config
}

func NewConsumer(
	kafkaConfig configs.Kafka,
	logger *zap.Logger,
) (Consumer, error) {
	saramaConsumer, err := sarama.NewConsumerGroup(
		kafkaConfig.Addresses,
		kafkaConfig.ClientID,
		newSaramaConsumerConfig(kafkaConfig),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create sarama consumer: %w", err)
	}

	return &consumer{
		saramaConsumer:            saramaConsumer,
		logger:                    logger,
		queueNameToHandlerFuncMap: make(map[string]MessageHandlerFunc),
	}, nil
}

func (c consumer) RegisterHandler(queueName string, handlerFunc MessageHandlerFunc) {
	c.queueNameToHandlerFuncMap[queueName] = handlerFunc
}

func (c consumer) Start(ctx context.Context) error {
	logger := utils.LoggerWithContext(ctx, c.logger)

	exitSignalChannel := make(chan os.Signal, 1)
	signal.Notify(exitSignalChannel, os.Interrupt)

	fmt.Println("notification_service kafka consumer started")
	logger.Info("notification_service kafka consumer started")
	for queueName, handlerFunc := range c.queueNameToHandlerFuncMap {
		go func(queueName string, handlerFunc MessageHandlerFunc) {
			if err := c.saramaConsumer.Consume(
				context.Background(),
				[]string{queueName},
				newConsumerHandler(handlerFunc, exitSignalChannel),
			); err != nil {
				logger.
					With(zap.String("queue_name", queueName)).
					With(zap.Error(err)).
					Error("failed to consume message from queue")
			}
		}(queueName, handlerFunc)
	}

	<-exitSignalChannel
	return nil
}
