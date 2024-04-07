import minimist from "minimist";
import { startGRPCServer } from "./cmd/start_grpc_server";
import { startKafkaConsumer } from "./cmd/start_kafka_consumer";

const args = minimist(process.argv);

if (args["start_grpc_server"]) {
    startGRPCServer(".env");
} else if (args["start_kafka_consumer"]) {
    startKafkaConsumer(".env");
} else {
    startGRPCServer(".env").then();
}