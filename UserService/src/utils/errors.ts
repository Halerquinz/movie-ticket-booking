import { status } from "@grpc/grpc-js"

export class ErrorWithStatus extends Error {
    constructor(
        public readonly message: string,
        public readonly status: status
    ) {
        super(message);
    }

    public static wrapWithStatus(e: any, status: status): ErrorWithStatus {
        if (e instanceof Error) {
            return new ErrorWithStatus(e.message, status);
        }
        return new ErrorWithStatus(JSON.stringify(e), status);
    }
}