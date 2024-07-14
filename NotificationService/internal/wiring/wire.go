//go:build wireinject
// +build wireinject

// go:generate go run github.com/google/wire/cmd/wire
package wiring

import (
	"NotificationService/internal/app"
	"NotificationService/internal/configs"
	"NotificationService/internal/dataaccess"
	"NotificationService/internal/handler"
	"NotificationService/internal/logic"
	"NotificationService/internal/utils"

	"github.com/google/wire"
)

var WireSet = wire.NewSet(
	app.WireSet,
	configs.WireSet,
	dataaccess.WireSet,
	handler.WireSet,
	logic.WireSet,
	utils.WireSet,
)

func InitStandaloneServer(configFilePath configs.ConfigFilePath) (app.StandaloneServer, func(), error) {
	wire.Build(WireSet)

	return app.StandaloneServer{}, nil, nil
}
