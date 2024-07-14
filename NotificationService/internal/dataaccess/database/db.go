package database

import (
	"NotificationService/internal/configs"
	"context"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

type Database struct {
	*gorm.DB
}

func NewDatabase(dbConfig configs.Database) (Database, func(), error) {
	dbMigrator, err := NewMigrator(dbConfig)
	if err != nil {
		return Database{}, nil, err
	}
	err = dbMigrator.Up(context.Background())
	if err != nil {
		return Database{}, nil, err
	}

	db, cleanup, err := NewGORMDatabase(dbConfig)
	if err != nil {
		return Database{}, nil, err
	}

	return Database{
		DB: db,
	}, cleanup, nil
}

func NewGORMDatabase(dbConfig configs.Database) (*gorm.DB, func(), error) {
	// Create data source name (DSN) string
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Shanghai", dbConfig.Host, dbConfig.Username, dbConfig.Password, dbConfig.Database, dbConfig.Port)

	// Open GORM database connection
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})

	if err != nil {
		return nil, nil, err
	}

	cleanup := func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}

	return db, cleanup, nil
}
