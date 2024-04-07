import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { UserServiceConfig, USER_SERVICE_CONFIG_TOKEN } from "../../config";
import { UserServiceClient } from "../../proto/gen/UserService";
import { ProtoGrpcType } from "../../proto/gen/user_service";

export function getUserServiceDM(
    userServiceConfig: UserServiceConfig
): UserServiceClient {
    const userServiceProtoGrpc = loadUserServiceProtoGrpc(
        userServiceConfig.protoPath
    );
    return new userServiceProtoGrpc.UserService(
        `${userServiceConfig.host}:${userServiceConfig.port}`,
        credentials.createInsecure()
    );
}

function loadUserServiceProtoGrpc(protoPath: string): ProtoGrpcType {
    const packageDefinition = loadSync(protoPath, {
        keepCase: false,
        enums: String,
        defaults: false,
        oneofs: true,
    });
    const userServicePackageDefinition = loadPackageDefinition(
        packageDefinition
    ) as unknown;
    return userServicePackageDefinition as ProtoGrpcType;
}

injected(getUserServiceDM, USER_SERVICE_CONFIG_TOKEN);

export const USER_SERVICE_DM_TOKEN =
    token<UserServiceClient>("UserServiceClient");
