import { credentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { injected, token } from "brandi";
import { MOVIE_SERVICE_CONFIG_TOKEN, MovieServiceConfig } from "../../config";
import { MovieServiceClient } from "../../proto/gen/MovieService";
import { ProtoGrpcType } from "../../proto/gen/movie_service";


export function getMovieServiceDM(movieServiceConfig: MovieServiceConfig): MovieServiceClient {
    const movieServiceProtoGrpc = loadMovieServiceProtoGrpc(movieServiceConfig.protoPath);
    return new movieServiceProtoGrpc.MovieService(
        `${movieServiceConfig.host}:${movieServiceConfig.port}`,
        credentials.createInsecure(),
        {
            "grpc.max_receive_message_length": -1,
            "grpc.max_send_message_length": -1,
        }
    );
}

function loadMovieServiceProtoGrpc(protoPath: string): ProtoGrpcType {
    const packageDefinition = loadSync(protoPath, {
        enums: Number,
        keepCase: false,
        defaults: false,
        oneofs: true
    });
    const packageObject = loadPackageDefinition(packageDefinition) as unknown;
    return packageObject as ProtoGrpcType;
}

injected(getMovieServiceDM, MOVIE_SERVICE_CONFIG_TOKEN);
export const MOVIE_SERVICE_DM_TOKEN = token<MovieServiceClient>("MovieServiceClient");
