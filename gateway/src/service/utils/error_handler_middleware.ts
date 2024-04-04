import { injected, token } from "brandi";
import { ErrorRequestHandler, NextFunction } from "express";
import { Logger } from "winston";
import { ErrorWithHTTPCode, LOGGER_TOKEN, maskSensitiveFields } from "../../utils";

export interface ErrorHandlerMiddlewareFactory {
    catchToErrorHandlerMiddleware(callback: () => Promise<void>, next: NextFunction): Promise<void>;
    getErrorHandlerMiddleware(): ErrorRequestHandler;
}

export class ErrorHandlerMiddlewareFactoryImpl implements ErrorHandlerMiddlewareFactory {
    constructor(
        private readonly logger: Logger
    ) { }

    public async catchToErrorHandlerMiddleware(callback: () => Promise<void>, next: NextFunction): Promise<void> {
        try {
            await callback();
        } catch (error) {
            next(error);
        }
    }

    public getErrorHandlerMiddleware(): ErrorRequestHandler {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return ((err, req, res, _) => {
            this.logger.error("failed to handle request", {
                method: req.method,
                path: req.originalUrl,
                body: maskSensitiveFields(req.body),
                error: err,
            });

            if (err instanceof ErrorWithHTTPCode) {
                res.status(err.code).json({ message: err.message });
            }
        })
    }
}

injected(ErrorHandlerMiddlewareFactoryImpl, LOGGER_TOKEN);

export const ERROR_HANDLER_MIDDLEWARE_FACTORY_TOKEN = token<ErrorHandlerMiddlewareFactoryImpl>("ErrorHandlerMiddlewareFactory");


