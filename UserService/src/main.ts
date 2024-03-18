import minimist from "minimist";

const args = minimist(process.argv);

import { Container, token } from 'brandi';
import { startGRPCServer } from "./cmd/start_grpc_server";

startGRPCServer(".env").then();