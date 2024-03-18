import { Container } from "brandi";
import { SESSION_MANAGEMENT_OPERATOR_TOKEN, SessionManagementOperatorImpl } from "./session_management_operator";

export * from "./session_management_operator";

export function bindToContainer(container: Container): void {
    container.bind(SESSION_MANAGEMENT_OPERATOR_TOKEN).toInstance(SessionManagementOperatorImpl).inSingletonScope();
}