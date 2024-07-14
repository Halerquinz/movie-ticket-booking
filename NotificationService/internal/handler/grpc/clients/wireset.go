package clients

import (
	bookingserserviceclient "NotificationService/internal/handler/grpc/clients/booking_service"
	movieserviceclient "NotificationService/internal/handler/grpc/clients/movie_service"
	userserviceclient "NotificationService/internal/handler/grpc/clients/user_service"

	"github.com/google/wire"
)

var WireSet = wire.NewSet(
	userserviceclient.WireSet,
	movieserviceclient.WireSet,
	bookingserserviceclient.WireSet,
)
