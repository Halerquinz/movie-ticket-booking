import { Container } from "brandi";
import { PRICE_MANAGEMENT_OPERATOR_TOKEN, PriceManagementOperatorImpl } from "./price_management_operator";

export * from "./price_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(PRICE_MANAGEMENT_OPERATOR_TOKEN).toInstance(PriceManagementOperatorImpl).inSingletonScope();
}