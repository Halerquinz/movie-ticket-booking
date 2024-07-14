package database

import "github.com/google/wire"

var WireSet = wire.NewSet(
	NewNotificationDataAccessor,
	NewMigrator,
	NewDatabase,
	NewGORMDatabase,
)
