import minimist from "minimist";
import { startGRPCServer } from "./cmd/start_grpc_server";

const args = minimist(process.argv);

if (args["start_grpc_server"]) {
    startGRPCServer(".env").then();
}