package app

import (
	"NotificationService/internal/handler/consumers"
	"NotificationService/internal/handler/grpc"
	"NotificationService/internal/utils"
	"context"
	"syscall"

	"go.uber.org/zap"
)

type StandaloneServer struct {
	grpcServer                       grpc.Server
	notificationServiceKafkaConsumer consumers.NotificationServiceKafkaConsumer
	logger                           *zap.Logger
}

func NewStandAloneServer(
	grpcServer grpc.Server,
	notificationServiceKafkaConsumer consumers.NotificationServiceKafkaConsumer,
	logger *zap.Logger,
) (StandaloneServer, error) {
	return StandaloneServer{
		grpcServer:                       grpcServer,
		notificationServiceKafkaConsumer: notificationServiceKafkaConsumer,
		logger:                           logger,
	}, nil
}

func (s *StandaloneServer) Start() {
	go func() {
		err := s.grpcServer.Start(context.Background())
		s.logger.With(zap.Error(err)).Error("gRPC server stopped")
	}()

	go func() {
		err := s.notificationServiceKafkaConsumer.Start(context.Background())
		s.logger.With(zap.Error(err)).Info("notification kafka consumer stopped")
	}()

	utils.WaitForSignals(syscall.SIGINT, syscall.SIGTERM)
}
