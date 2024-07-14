package s3

import (
	"NotificationService/internal/configs"
	"context"
	"io"

	"github.com/minio/minio-go"
	"go.uber.org/zap"
)

type Client interface {
	CreateBucketIfNotExist(ctx context.Context) error
	UploadFile(ctx context.Context, fileName string, fileData io.Reader) error
	GetFile(ctx context.Context, fileName string) ([]byte, error)
}

type S3Client struct {
	minioClient *minio.Client
	bucket      string
	logger      *zap.Logger
}

func NewClient(
	s3Config configs.S3,
	logger *zap.Logger,
) (Client, error) {
	minioClient, err := minio.New(s3Config.Address, s3Config.Username, s3Config.Password, false)
	if err != nil {
		logger.With(zap.Error(err)).Error("failed to create minio client")
		return nil, err
	}

	return &S3Client{
		minioClient: minioClient,
		bucket:      s3Config.Bucket,
		logger:      logger,
	}, nil
}

func (s *S3Client) CreateBucketIfNotExist(ctx context.Context) error {
	exist, err := s.minioClient.BucketExists(s.bucket)
	if err != nil {
		s.logger.With(zap.Error(err)).Error("failed to check bucket exist")
		return err
	}

	if !exist {
		err := s.minioClient.MakeBucket(s.bucket, "")
		if err != nil {
			s.logger.With(zap.Error(err)).Error("failed to create bucket")
			return err
		}
	}

	return nil
}

func (s *S3Client) UploadFile(ctx context.Context, fileName string, fileData io.Reader) error {
	_, err := s.minioClient.PutObject(s.bucket, fileName, fileData, -1, minio.PutObjectOptions{})
	if err != nil {
		s.logger.With(zap.Error(err)).Error("failed to upload file")
		return err
	}
	return nil
}

func (s *S3Client) GetFile(ctx context.Context, fileName string) ([]byte, error) {
	object, err := s.minioClient.GetObjectWithContext(ctx, s.bucket, fileName, minio.GetObjectOptions{})
	if err != nil {
		s.logger.With(zap.Error(err)).Error("failed to get file")
		return nil, err
	}

	defer object.Close()
	data, err := io.ReadAll(object)
	if err != nil {
		s.logger.With(zap.Error(err)).Error("failed to read file data")
		return nil, err
	}

	return data, nil
}
