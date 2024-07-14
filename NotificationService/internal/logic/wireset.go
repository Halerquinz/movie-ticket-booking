package logic

import "github.com/google/wire"

var WireSet = wire.NewSet(
	NewMailer,
	NewNotificationLogic,
)
