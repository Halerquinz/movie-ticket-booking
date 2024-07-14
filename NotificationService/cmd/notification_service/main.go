package main

import (
	"NotificationService/internal/configs"
	"NotificationService/internal/wiring"
	"fmt"
	"log"

	"github.com/spf13/cobra"
)

var (
	version    string
	commitHash string
)

const (
	flagConfigFilePath = "config-file-path"
)

func standaloneServer() *cobra.Command {
	command := &cobra.Command{
		Use: "standalone-server",
		RunE: func(cmd *cobra.Command, args []string) error {
			configFilePath, err := cmd.Flags().GetString(flagConfigFilePath)
			if err != nil {
				return err
			}

			app, cleanup, err := wiring.InitStandaloneServer(configs.ConfigFilePath(configFilePath))
			if err != nil {
				return err
			}
			defer cleanup()

			app.Start()
			return nil
		},
	}

	command.Flags().String(flagConfigFilePath, "", "If provided, will use the provided config file")

	return command
}

func main() {
	rootCommand := &cobra.Command{
		Version: fmt.Sprintf("%s-%s", version, commitHash),
	}

	rootCommand.AddCommand(
		standaloneServer(),
	)

	if err := rootCommand.Execute(); err != nil {
		log.Panic(err)
	}
}
