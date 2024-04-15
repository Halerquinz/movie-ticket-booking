import minimist from "minimist";
import { startGRPCServer } from "./cmd/start_grpc_server";
import { startKafkaConsumer } from "./cmd/start_kafka_consumer";
import { insertDefaultPrice } from "./cmd/insert_default_price";

const args = minimist(process.argv);

if (args["start_grpc_server"]) {
    startGRPCServer(".env");
} else if (args["start_kafka_consumer"]) {
    startKafkaConsumer(".env");
} else if (args["insert_default_price"]) {
    insertDefaultPrice(".env")
} else {
    startGRPCServer(".env").then();
}