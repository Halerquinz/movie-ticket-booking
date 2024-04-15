import { Container } from "brandi";
import { INSERT_DEFAULT_PRICE_JOB_TOKEN, InsertDefaultPriceJobImpl } from "./insert_default_price";

export * from "./insert_default_price";

export function bindToContainer(container: Container): void {
    container.bind(INSERT_DEFAULT_PRICE_JOB_TOKEN).toInstance(InsertDefaultPriceJobImpl).inSingletonScope();
}