import { Container } from "brandi";
import { KNEX_INSTANCE_TOKEN, newKnexInstance } from "./knex";

export * from "./knex";

export function bindToContainer(container: Container): void {
    container.bind(KNEX_INSTANCE_TOKEN).toInstance(newKnexInstance).inSingletonScope();
}