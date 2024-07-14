package configs

type S3 struct {
	Address  string `yaml:"address"`
	Bucket   string `yaml:"bucket"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}
