import { Container } from "brandi";
import { MOVIE_SERVICE_KAFKA_CONSUMER_TOKEN, MovieServiceKafkaConsumer } from "./consumer";
import { SCREEN_CREATED_MESSAGE_HANDLER_TOKEN, ScreenCreatedMessageHandlerImpl } from "./screen_created";

export * from "./consumer";
export * from "./screen_created";

export function bindToContainer(container: Container): void {
    container.bind(MOVIE_SERVICE_KAFKA_CONSUMER_TOKEN).toInstance(MovieServiceKafkaConsumer).inSingletonScope();
    container.bind(SCREEN_CREATED_MESSAGE_HANDLER_TOKEN).toInstance(ScreenCreatedMessageHandlerImpl).inSingletonScope();
}