package s3

import "github.com/google/wire"

var WireSet = wire.NewSet(
	NewClient,
)
