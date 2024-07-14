package userservice

import (
	"NotificationService/internal/configs"
	"NotificationService/internal/generated/user_service"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func NewClient(
	config configs.UserServiceClient,
	logger *zap.Logger,
) (user_service.UserServiceClient, error) {
	var opts = []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	logger = logger.Named("UserServiceClient")

	hosts := config.Addresses
	clients := make([]user_service.UserServiceClient, 0, len(hosts))
	for _, host := range hosts {
		conn, err := grpc.NewClient(host, opts...)
		if err != nil {
			logger.With(zap.Error(err), zap.String("address", host)).Error("failed to dial host")
			return nil, err
		}
		client := user_service.NewUserServiceClient(conn)
		clients = append(clients, client)
	}

	return clients[0], nil
}
