package configs

import (
	"NotificationService/configs"
	"fmt"
	"os"

	"gopkg.in/yaml.v2"
)

type ConfigFilePath string

type Config struct {
	GRPC                 GRPC                 `yaml:"grpc"`
	Database             Database             `yaml:"database"`
	Log                  Log                  `yaml:"log"`
	S3                   S3                   `yaml:"s3"`
	Kafka                Kafka                `yaml:"kafka"`
	UserServiceClient    UserServiceClient    `yaml:"user_service_client"`
	MovieServiceClient   MovieServiceClient   `yaml:"movie_service_client"`
	BookingServiceClient BookingServiceClient `yaml:"booking_service_client"`
	Mail                 Mail                 `yaml:"mail"`
}

func NewConfig(configFilePath ConfigFilePath) (Config, error) {
	var (
		configBytes []byte = configs.DefaultConfigBytes
		config      Config
		err         error
	)

	if configFilePath != "" {
		configBytes, err = os.ReadFile(string(configFilePath))
		if err != nil {
			return Config{}, fmt.Errorf("error reading configuration file: %w", err)
		}
	}

	err = yaml.Unmarshal(configBytes, &config)
	if err != nil {
		return Config{}, fmt.Errorf("error unmarshal configuration file %w", err)
	}

	return config, nil
}
