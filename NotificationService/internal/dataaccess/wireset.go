package dataaccess

import (
	"NotificationService/internal/dataaccess/database"
	"NotificationService/internal/dataaccess/kafka"
	"NotificationService/internal/dataaccess/s3"

	"github.com/google/wire"
)

var WireSet = wire.NewSet(
	database.WireSet,
	kafka.WireSet,
	s3.WireSet,
)
