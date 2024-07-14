package configs

import "github.com/google/wire"

var WireSet = wire.NewSet(
	NewConfig,
	wire.FieldsOf(new(Config), "GRPC"),
	wire.FieldsOf(new(Config), "Database"),
	wire.FieldsOf(new(Config), "Log"),
	wire.FieldsOf(new(Config), "S3"),
	wire.FieldsOf(new(Config), "Kafka"),
	wire.FieldsOf(new(Config), "UserServiceClient"),
	wire.FieldsOf(new(Config), "MovieServiceClient"),
	wire.FieldsOf(new(Config), "BookingServiceClient"),
	wire.FieldsOf(new(Config), "Mail"),
)
