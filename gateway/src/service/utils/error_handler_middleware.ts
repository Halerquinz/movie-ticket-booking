import { injected, token } from "brandi";
import { ErrorRequestHandler } from "express";
import { Logger } from "winston";
import { ErrorWithHTTPCode, LOGGER_TOKEN, maskSensitiveFields } from "../../utils";
import { error as OpenAPIError } from "express-openapi-validator";

export function getErrorHandlerMiddleware(logger: Logger): ErrorRequestHandler {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return ((err, req, res, _) => {
        logger.error("failed to handle request", {
            method: req.method,
            path: req.originalUrl,
            body: maskSensitiveFields(req.body),
            error: err,
        });

        if (err instanceof ErrorWithHTTPCode) {
            res.json({ message: err.message });
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
