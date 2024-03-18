import { injected, token } from "brandi";
import { ErrorRequestHandler } from "express";
import { Logger } from "winston";
import { ErrorWithHTTPCode, LOGGER_TOKEN, maskSensitiveFields } from "../../utils";
import { error as OpenAPIError } from "express-openapi-validator";
import httpStatus from "http-status";

export function getErrorHandlerMiddleware(logger: Logger): ErrorRequestHandler {
    return ((err, req, res) => {
        logger.error("failed to handle request", {
            method: req.method,
            path: req.originalUrl,
            body: maskSensitiveFields(req.body),
            error: err,
        });

        const statusCode = err.status || 500;
        res.status(statusCode).json({
            status: err.status || "error",
            reasonStatuscode: `error ${statusCode}`,
            message: err.message || "Server error",
        });

        if (err instanceof ErrorWithHTTPCode) {
            res.json({ message: err.message });
            console.log("ngu");
        } else if (err instanceof OpenAPIError.BadRequest) {
            res.json({ message: "Bad request" });
        } else if (err instanceof OpenAPIError.Unauthorized) {
            res.json({ message: "Unauthorized" });
        } else if (err instanceof OpenAPIError.NotFound) {
            res.json({ message: "Not found" });
        } else {
            res.json({ message: "Internal Server Error" });
        }
    })
}

injected(getErrorHandlerMiddleware, LOGGER_TOKEN);

export const ERROR_HANDLER_MIDDLEWARE_TOKEN = token<ErrorRequestHandler>("ErrorHandlerMiddleware");
