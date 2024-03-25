import { Client } from "@elastic/elasticsearch";
import { injected, token } from "brandi";
import { createLogger, format, Logger, transports } from "winston";
import "winston-daily-rotate-file";
import { LogConfig, LOG_CONFIG_TOKEN, ELASTICSEARCH_CONFIG_TOKEN } from "../config";
import { ElasticsearchTransport } from "winston-elasticsearch";
import { ELASTICSEARCH_CLIENT_TOKEN } from "../dataaccess/elasticsearch";

export function initializeLogger(elasticsearchClient: Client, logConfig: LogConfig): Logger {
    const logger = createLogger({
        format: format.combine(format.timestamp(), format.json()),
        defaultMeta: {},
        transports: [
            new transports.DailyRotateFile({
                level: "error",
                dirname: logConfig.logDir,
                filename: "error-%DATE%.log",
                datePattern: "YYYY-MM-DD-HH",
                maxFiles: logConfig.maxFiles,
            }),
            new transports.DailyRotateFile({
                level: "info",
                dirname: logConfig.logDir,
                filename: "info-%DATE%.log",
                datePattern: "YYYY-MM-DD-HH",
                maxFiles: logConfig.maxFiles,
            }),
            new ElasticsearchTransport({
                level: "info",
                source: "user_service",
                client: elasticsearchClient,
            }),
        ],
    });

    if (process.env.NODE_ENV === "production") {
        logger.level = "info";
    } else {
        logger.level = "debug";
    }

    return logger;
}

injected(initializeLogger, ELASTICSEARCH_CLIENT_TOKEN, LOG_CONFIG_TOKEN);

export const LOGGER_TOKEN = token<Logger>("Logger");
