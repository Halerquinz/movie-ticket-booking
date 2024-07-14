package handler

import (
	"NotificationService/internal/handler/consumers"
	"NotificationService/internal/handler/grpc"
	pdfGenerator "NotificationService/internal/handler/pdf_generator"

	"github.com/google/wire"
)

var WireSet = wire.NewSet(
	grpc.WireSet,
	consumers.WireSet,
	pdfGenerator.WireSet,
)
