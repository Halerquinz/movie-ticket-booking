package kafka

import (
	"NotificationService/internal/dataaccess/kafka/consumer"
	"NotificationService/internal/dataaccess/kafka/producer"

	"github.com/google/wire"
)

var WireSet = wire.NewSet(
	consumer.WireSet,
	producer.WireSet,
)
