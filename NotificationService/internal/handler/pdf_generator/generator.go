package pdfgenerator

import (
	"bytes"
	"fmt"
	"time"

	"github.com/jung-kurt/gofpdf"
	"github.com/skip2/go-qrcode"
	"go.uber.org/zap"
)

type PDFGenerateParams struct {
	BookingId       uint32
	Username        string
	Email           string
	Amount          uint64
	Currency        string
	MovieName       string
	SeatNo          string
	TheaterName     string
	TheaterLocation string
	ScreenName      string
	TimeStart       int64
	TimeEnd         int64
}

type PDFGenerator interface {
	Generate(PDFGenerateParams) (*bytes.Buffer, error)
}

func NewPDFGenerator(
	logger *zap.Logger,
) PDFGenerator {
	return &pdfGenerator{
		logger: logger,
	}
}

type pdfGenerator struct {
	logger *zap.Logger
}

func (g pdfGenerator) Generate(params PDFGenerateParams) (*bytes.Buffer, error) {
	logger := g.logger.With(zap.Uint32("generate invoice", params.BookingId))

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Generate QR code
	qrInfo := fmt.Sprintf("%s - %s - %s - %s - Showtime: %s",
		params.TheaterName,
		params.ScreenName,
		params.MovieName,
		params.SeatNo,
		g.unixTimeToVNDateTime(params.TimeStart),
	)
	qrCode, err := qrcode.New(qrInfo, qrcode.Medium)
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to get create QR code")
		return nil, err
	}

	// Save QR code to file
	qrFilename := "qr_code.png"
	if err := qrCode.WriteFile(256, qrFilename); err != nil {
		logger.With(zap.Error(err)).Error("failed to save QR code")
		return nil, err
	}

	// Adding QR code image to PDF
	opts := gofpdf.ImageOptions{
		ImageType: "PNG",
		ReadDpi:   true,
	}
	pdf.ImageOptions(qrFilename, 165, 10, 30, 30, false, opts, 0, "")

	// Set font
	pdf.SetFont("Arial", "B", 12)

	// Title
	pdf.Cell(190, 10, "Movie Ticket Invoice")
	pdf.Ln(12)

	// Subtitle
	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(190, 10, params.TheaterName, "", 1, "C", false, 0, "")
	pdf.CellFormat(190, 10, params.TheaterLocation, "", 1, "C", false, 0, "")
	pdf.Ln(5)

	// Customer Info
	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(30, 10, "Customer:")
	pdf.SetFont("Arial", "", 10)
	pdf.Cell(160, 10, params.Username)
	pdf.Ln(5)

	pdf.SetFont("Arial", "B", 10)
	pdf.Cell(30, 10, "Email:")
	pdf.SetFont("Arial", "", 10)
	pdf.Cell(160, 10, params.Email)
	pdf.Ln(10)

	// Invoice table
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(190, 10, "Order Details", "1", 0, "C", false, 0, "")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 10)
	pdf.CellFormat(95, 10, "Item", "1", 0, "", false, 0, "")
	pdf.CellFormat(35, 10, "Quantity", "1", 0, "C", false, 0, "")
	pdf.CellFormat(30, 10, "Unit Price", "1", 0, "C", false, 0, "")
	pdf.CellFormat(30, 10, "Total", "1", 0, "C", false, 0, "")
	pdf.Ln(10)

	itemDetail := fmt.Sprintf("%s - %s - %s - %s - %s",
		params.MovieName,
		params.TheaterName,
		params.ScreenName,
		g.unixTimeToVNDateTime(params.TimeStart),
		params.SeatNo,
	)

	// Start a new line
	pdf.SetX(pdf.GetX())
	startY := pdf.GetY()

	// Use MultiCell to ensure automatic line breaks
	pdf.MultiCell(95, 10, itemDetail, "1", "", false)

	// Get the height of the first cell
	currentY := pdf.GetY()

	// Move the X and Y positions back to the beginning of the line to print the following cells on the same row
	pdf.SetXY(pdf.GetX()+95, startY)

	// Create the following cells with the height of the MultiCell to ensure they are the same height as the MultiCell
	pdf.CellFormat(35, currentY-startY, fmt.Sprintf("%d", 1), "1", 0, "C", false, 0, "")
	pdf.CellFormat(30, currentY-startY, fmt.Sprintf("%d %s", params.Amount, params.Currency), "1", 0, "C", false, 0, "")
	pdf.CellFormat(30, currentY-startY, fmt.Sprintf("%d %s", params.Amount, params.Currency), "1", 0, "C", false, 0, "")
	pdf.Ln(-1)

	// Footer note
	pdf.SetFont("Arial", "I", 10)
	pdf.CellFormat(190, 10, "Thank you!", "", 0, "C", false, 0, "")

	// Output the PDF
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		logger.With(zap.Error(err)).Error("failed to write PDF to buffer")
		return nil, err
	}

	return &buf, nil
}

// unixTimeToVNDateTime converts a Unix timestamp (in milliseconds) to a formatted Vietnamese date-time string.
func (g pdfGenerator) unixTimeToVNDateTime(timestamp int64) string {
	logger := g.logger.With(zap.Int64("convert unix timestamp to VN Date time", timestamp))

	loc, err := time.LoadLocation("Asia/Ho_Chi_Minh")
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to load location")
		return ""
	}
	// Convert milliseconds to seconds for time.Unix
	t := time.Unix(timestamp/1000, (timestamp%1000)*1000000).In(loc)
	return t.Format("Monday, 02/01/2006 15:04:05")
}
