package userservice

import (
	"NotificationService/internal/configs"
	"NotificationService/internal/generated/movie_service"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func NewClient(
	config configs.MovieServiceClient,
	logger *zap.Logger,
) (movie_service.MovieServiceClient, error) {
	var opts = []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	logger = logger.Named("MovieServiceClient")

	hosts := config.Addresses
	clients := make([]movie_service.MovieServiceClient, 0, len(hosts))
	for _, host := range hosts {
		conn, err := grpc.NewClient(host, opts...)
		if err != nil {
			logger.With(zap.Error(err), zap.String("address", host)).Error("failed to dial host")
			return nil, err
		}
		client := movie_service.NewMovieServiceClient(conn)
		clients = append(clients, client)
	}

	return clients[0], nil
}
