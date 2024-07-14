package consumers

import "github.com/google/wire"

var WireSet = wire.NewSet(
	NewNotificationCreatedMessageHandler,
	NewPaymentTransactionCompletedMessageHandler,
	NewNotificationServiceKafkaConsumer,
)
