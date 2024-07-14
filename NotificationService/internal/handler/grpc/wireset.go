package grpc

import (
	"NotificationService/internal/handler/grpc/clients"

	"github.com/google/wire"
)

var WireSet = wire.NewSet(
	NewServer,
	NewHandler,
	clients.WireSet,
)
