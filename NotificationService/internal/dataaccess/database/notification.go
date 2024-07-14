package database

import (
	"context"
	"errors"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type NotificationStatus uint8

const (
	NotificationStatus_NOTIFICATION_STATUS_PENDING    NotificationStatus = 0
	NotificationStatus_NOTIFICATION_STATUS_PROCESSING NotificationStatus = 1
	NotificationStatus_NOTIFICATION_STATUS_SUCCESS    NotificationStatus = 2
	NotificationStatus_NOTIFICATION_STATUS_FAILED     NotificationStatus = 3
)

// Enum value maps for NotificationStatus.
var (
	NotificationStatus_name = map[int32]string{
		0: "NOTIFICATION_STATUS_PENDING",
		1: "NOTIFICATION_STATUS_PROCESSING",
		2: "NOTIFICATION_STATUS_SUCCESS",
		3: "NOTIFICATION_STATUS_FAILED",
	}
	NotificationStatus_value = map[string]int32{
		"NOTIFICATION_STATUS_PENDING":    0,
		"NOTIFICATION_STATUS_PROCESSING": 1,
		"NOTIFICATION_STATUS_SUCCESS":    2,
		"NOTIFICATION_STATUS_FAILED":     3,
	}
)

func (x NotificationStatus) Enum() *NotificationStatus {
	p := new(NotificationStatus)
	*p = x
	return p
}

type Notification struct {
	ID                  uint32             `gorm:"column:notification_id;primaryKey"`
	OfBookingId         uint32             `gorm:"column:of_booking_id"`
	Status              NotificationStatus `gorm:"column:status"`
	OriginalPDFFilename string             `gorm:"column:original_pdf_filename"`
}

func (Notification) TableName() string {
	return "notification_service_notification_tab"
}

type NotificationDataAccessor interface {
	CreateNotification(ctx context.Context, notification *Notification) (*Notification, error)
	UpdateNotification(ctx context.Context, notification *Notification) (*Notification, error)
	GetNotificationById(ctx context.Context, id uint32) (*Notification, error)
	GetNotificationByIdWithXLock(ctx context.Context, id uint32) (*Notification, error)
	GetNotificationListByStatus(ctx context.Context, status NotificationStatus) ([]*Notification, error)
	GetNotificationCount(ctx context.Context, status uint32) (uint32, error)
	WithDB(db *gorm.DB) NotificationDataAccessor
}

type notificationDataAccessor struct {
	database Database
	logger   *zap.Logger
}

func NewNotificationDataAccessor(database Database, logger *zap.Logger) NotificationDataAccessor {
	return &notificationDataAccessor{
		database: database,
		logger:   logger,
	}
}

func (n notificationDataAccessor) CreateNotification(ctx context.Context, notification *Notification) (*Notification, error) {
	logger := n.logger.With(zap.Any("notification", notification))

	result := n.database.Create(notification)
	if result.Error != nil {
		logger.With(zap.Error(result.Error)).Error("failed to create notification")
		return nil, result.Error
	}

	return notification, nil
}

func (n notificationDataAccessor) UpdateNotification(ctx context.Context, notification *Notification) (*Notification, error) {
	logger := n.logger.With(zap.Any("notification", notification))

	if notification.ID == 0 {
		err := errors.New("notification ID cannot be zero")
		logger.With(zap.Error(err)).Error("invalid notification ID")
		return nil, err
	}

	result := n.database.Save(notification)
	if result.Error != nil {
		logger.With(zap.Error(result.Error)).Error("failed to update notification")
		return nil, result.Error
	}

	return notification, nil
}

func (n notificationDataAccessor) GetNotificationById(ctx context.Context, id uint32) (*Notification, error) {
	logger := n.logger.With(zap.Uint32("id", id))

	var notification Notification
	result := n.database.First(&notification, id)
	if result.Error != nil {
		logger.With(zap.Error(result.Error)).Error("failed to get notification")
		return nil, result.Error
	}

	return &notification, nil
}

func (n notificationDataAccessor) GetNotificationByIdWithXLock(ctx context.Context, id uint32) (*Notification, error) {
	logger := n.logger.With(zap.Uint32("id", id))

	var notification Notification
	result := n.database.Set("gorm:query_option", "FOR UPDATE").First(&notification, id)
	if result.Error != nil {
		logger.With(zap.Error(result.Error)).Error("failed to get notification with x lock")
		return nil, result.Error
	}

	return &notification, nil
}

func (n notificationDataAccessor) GetNotificationListByStatus(ctx context.Context, status NotificationStatus) ([]*Notification, error) {
	logger := n.logger.With(zap.Uint8("status", uint8(status)))

	var notifications []*Notification
	result := n.database.Where("status = ?", status).Find(&notifications)
	if result.Error != nil {
		logger.With(zap.Error(result.Error)).Error("failed to get notification list by status")
		return nil, result.Error
	}

	return notifications, nil
}

func (n notificationDataAccessor) GetNotificationCount(ctx context.Context, bookingId uint32) (uint32, error) {
	logger := n.logger.With(zap.Uint32("notification_with_booking_id", bookingId))

	count := int64(0)
	if err := n.database.Model(&Notification{}).Where("of_booking_id = ?", bookingId).Count(&count).Error; err != nil {
		logger.With(zap.Error(err)).Error("failed to get notification count")
		return 0, err
	}

	return uint32(count), nil
}

func (n notificationDataAccessor) WithDB(db *gorm.DB) NotificationDataAccessor {
	return &notificationDataAccessor{
		database: n.database,
		logger:   n.logger,
	}
}
