import { ClientUnaryCall, requestCallback, ServiceError } from "@grpc/grpc-js";

export declare type GRPCClientUnaryCall<RequestType, ResponseType> = (
    request: RequestType,
    callback: requestCallback<ResponseType>
) => ClientUnaryCall;

export async function promisifyGRPCCall<RequestType, ResponseType>(
    clientUnaryCall: GRPCClientUnaryCall<RequestType, ResponseType>,
    request: RequestType
): Promise<{ error: ServiceError | null; response: ResponseType | undefined }> {
    return new Promise((resolve) => {
        clientUnaryCall(request, (error, response) => {
            resolve({ error, response });
        });
    });
}
