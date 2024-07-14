package userservice

import (
	"NotificationService/internal/configs"
	"NotificationService/internal/generated/booking_service"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func NewClient(
	config configs.BookingServiceClient,
	logger *zap.Logger,
) (booking_service.BookingServiceClient, error) {
	var opts = []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	logger = logger.Named("BookingServiceClient")

	hosts := config.Addresses
	clients := make([]booking_service.BookingServiceClient, 0, len(hosts))
	for _, host := range hosts {
		conn, err := grpc.NewClient(host, opts...)
		if err != nil {
			logger.With(zap.Error(err), zap.String("address", host)).Error("failed to dial host")
			return nil, err
		}
		client := booking_service.NewBookingServiceClient(conn)
		clients = append(clients, client)
	}

	return clients[0], nil
}
