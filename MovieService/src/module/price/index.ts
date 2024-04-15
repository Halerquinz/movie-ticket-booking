import { Container } from "brandi";
import { PRICE_MANAGEMENT_OPERATOR_TOKEN } from "./price_management_operator";
import { PriceDataAccessorImpl } from "../../dataaccess/db";

export * from "./price_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(PRICE_MANAGEMENT_OPERATOR_TOKEN).toInstance(PriceDataAccessorImpl).inSingletonScope();
}