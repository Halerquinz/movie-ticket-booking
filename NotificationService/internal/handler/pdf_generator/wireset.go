package pdfgenerator

import "github.com/google/wire"

var WireSet = wire.NewSet(
	NewPDFGenerator,
)
