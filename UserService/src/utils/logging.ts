import { injected, token } from "brandi";
import { createLogger, format, Logger, transports } from "winston";
import "winston-daily-rotate-file";
import { LogConfig, LOG_CONFIG_TOKEN } from "../config";

export function initializeLogger(logConfig: LogConfig): Logger {
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
        ],
    });

    if (process.env.NODE_ENV === "production") {
        logger.level = "info";
    } else {
        logger.level = "debug";
    }

    return logger;
}

injected(initializeLogger, LOG_CONFIG_TOKEN);

export const LOGGER_TOKEN = token<Logger>("Logger");
