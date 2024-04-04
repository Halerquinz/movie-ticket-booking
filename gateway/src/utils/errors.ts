import { status } from "@grpc/grpc-js";
import httpStatus from "http-status";

export class ErrorWithHTTPCode extends Error {
    constructor(public readonly message: string, public readonly code: number) {
        super(message);
    }

    public static wrapWithStatus(error: any, code: number): ErrorWithHTTPCode {
        if (error instanceof Error) {
            return new ErrorWithHTTPCode(error.message, code);
        }
        return new ErrorWithHTTPCode(JSON.stringify(error), code);
    }
}

const GRPC_STATUS_TO_HTTP_CODE = new Map<status, number>([
    [status.ALREADY_EXISTS, httpStatus.CONFLICT],
    [status.INTERNAL, httpStatus.INTERNAL_SERVER_ERROR],
    [status.INVALID_ARGUMENT, httpStatus.BAD_REQUEST],
    [status.NOT_FOUND, httpStatus.NOT_FOUND],
    [status.OK, httpStatus.OK],
    [status.PERMISSION_DENIED, httpStatus.FORBIDDEN],
    [status.UNAUTHENTICATED, httpStatus.UNAUTHORIZED],
    [status.FAILED_PRECONDITION, httpStatus.CONFLICT],
]);

export function getHttpCodeFromGRPCStatus(grpcStatus: status | number): number {
    return GRPC_STATUS_TO_HTTP_CODE.get(grpcStatus) || httpStatus.INTERNAL_SERVER_ERROR;
}