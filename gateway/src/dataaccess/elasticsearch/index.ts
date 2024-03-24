import { Container } from "brandi";
import { ELASTICSEARCH_CLIENT_TOKEN, newElasticsearchClient } from "./client";

export * from "./client";

export function bindToContainer(container: Container): void {
    container.bind(ELASTICSEARCH_CLIENT_TOKEN).toInstance(newElasticsearchClient).inSingletonScope();
}
