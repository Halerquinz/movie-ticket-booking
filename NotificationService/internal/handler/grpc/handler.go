package grpc

import (
	pb "NotificationService/internal/generated/notification_service"
	"NotificationService/internal/logic"
	"context"
)

type Handler struct {
	pb.UnimplementedNotificationServiceServer
	notificationLogic logic.NotificationLogic
}

func NewHandler(
	notificationLogic logic.NotificationLogic,
) (pb.NotificationServiceServer, error) {
	return &Handler{
		notificationLogic: notificationLogic,
	}, nil
}

func (h *Handler) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloResponse, error) {
	err := h.notificationLogic.CreateNotification(ctx, uint32(in.BookingId))
	if err != nil {
		return nil, err
	}

	return &pb.HelloResponse{
		Message: "ngu",
	}, nil
}
