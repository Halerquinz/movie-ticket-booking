import minimist from "minimist";
import { startGRPCServer } from "./cmd/start_grpc_server";
import { startWebhookServer } from "./cmd/start_webhook_server";

const args = minimist(process.argv);

if (args["start_grpc_server"]) {
    startGRPCServer(".env").then();
} else if (args["start_webhook_server"]) {
    startWebhookServer(".env").then();
} else {
    startGRPCServer(".env").then();
}