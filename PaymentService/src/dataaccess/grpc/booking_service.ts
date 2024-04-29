import { credentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { BOOKING_SERVICE_CONFIG_TOKEN, BookingServiceConfig } from "../../config";
import { BookingServiceClient } from "../../proto/gen/BookingService";
import { ProtoGrpcType } from "../../proto/gen/booking_service";

export function getBookingServiceDM(bookingServiceConfig: BookingServiceConfig): BookingServiceClient {
    const bookingServiceProtoGrpc = loadBookingServiceProtoGrpc(bookingServiceConfig.protoPath);
    return new bookingServiceProtoGrpc.BookingService(
        `${bookingServiceConfig.host}:${bookingServiceConfig.port}`,
        credentials.createInsecure(),
        {
            "grpc.max_receive_message_length": -1,
            "grpc.max_send_message_length": -1,
        }
    );
}

function loadBookingServiceProtoGrpc(protoPath: string): ProtoGrpcType {
    const packageDefinition = loadSync(protoPath, {
        enums: Number,
        keepCase: false,
        defaults: false,
        oneofs: true,
        longs: Number
    });
    const packageObject = loadPackageDefinition(packageDefinition) as unknown;
    return packageObject as ProtoGrpcType;
}

injected(getBookingServiceDM, BOOKING_SERVICE_CONFIG_TOKEN);

export const BOOKING_SERVICE_DM_TOKEN = token<BookingServiceClient>("BookingServiceClient");
