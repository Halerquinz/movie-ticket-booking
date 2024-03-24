import minimist from "minimist";
import { startGRPCServer } from "./cmd/start_grpc_server";
import { initialize } from "./cmd/initialize";
import { deleteExpiredBlacklistedToken } from "./cmd/delete_expired_blacklisted_token";

const args = minimist(process.argv);

if (args["start_grpc_server"]) {
    startGRPCServer(".env").then();
} else if (args["initialize"]) {
    initialize(".env").then();
} else if (args["delete_expired_blacklisted_token"]) {
    deleteExpiredBlacklistedToken(".env").then();
} else {
    startGRPCServer(".env").then();
}