VERSION := $(shell cat VERSION)
COMMIT_HASH := $(shell git rev-parse HEAD)
PROJECT_NAME := notification_service
DATABASE_URL := postgres://postgres:admin@localhost:5436/movie_ticket_booking_notification_service_db?sslmode=disable

.PHONY: generate
generate:
	buf generate api
	wire internal/wiring/wire.go
	go generate ./...

.PHONY: build
build:
	go build \
		-ldflags "-X main.version=$(VERSION) -X main.commitHash=$(COMMIT_HASH)" \
		-o build/$(PROJECT_NAME) \
		cmd/$(PROJECT_NAME)/*.go

.PHONY: clean
clean:
	rm -rf build/

.PHONY: standalone-server
standalone-server:
	go run ./cmd/notification_service/main.go standalone-server

.PHONY: new_migration
new_migration:
	migrate create -ext sql -dir ./internal/dataaccess/database/migrations/postgres -seq ${NAME}

.PHONY: migrations_up 
migrations_up:
	migrate -database ${DATABASE_URL} -path ./internal/dataaccess/database/migrations/postgres up

.PHONY: migrations_down 
migrations_down:
	migrate -database ${DATABASE_URL} -path ./internal/dataaccess/database/migrations/postgres down

.PHONY: force
force:
	migrate -database ${DATABASE_URL} -path ./internal/dataaccess/database/migrations/postgres force 2



