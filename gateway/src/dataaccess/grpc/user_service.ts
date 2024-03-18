import { credentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { ProtoGrpcType } from "../../proto/gen/user_service";
import { USER_SERVICE_CONFIG_TOKEN, UserServiceConfig } from "../../config/user_service";
import { injected, token } from "brandi";
import { UserServiceClient } from "../../proto/gen/UserService";


export function getUserServiceDM(userServiceConfig: UserServiceConfig): UserServiceClient {
    const userServiceProtoGrpc = loadUserServiceProtoGrpc(userServiceConfig.protoPath);
    return new userServiceProtoGrpc.UserService(
        `${userServiceConfig.host}:${userServiceConfig.port}`,
        credentials.createInsecure()
    );
}

function loadUserServiceProtoGrpc(protoPath: string): ProtoGrpcType {
    const packageDefinition = loadSync(protoPath, {
        enums: Number,
        keepCase: false,
        defaults: false,
        oneofs: true
    });
    const packageObject = loadPackageDefinition(packageDefinition) as unknown;
    return packageObject as ProtoGrpcType;
}

injected(getUserServiceDM, USER_SERVICE_CONFIG_TOKEN);
export const USER_SERVICE_DM_TOKEN = token<UserServiceClient>("UserServiceClient");
