import { Container } from "brandi";
import { JWTGenerator, TOKEN_GENERATOR_FACTORY_TOKEN, TOKEN_GENERATOR_TOKEN } from "./generator";
import { TOKEN_MANAGEMENT_OPERATOR_TOKEN, TokenManagementOperatorImpl } from "./token_management_operator";

export * from "./generator";
export * from "./token_management_operator";

export async function bindToContainer(container: Container): Promise<void> {
    container.bind(TOKEN_MANAGEMENT_OPERATOR_TOKEN).toInstance(TokenManagementOperatorImpl).inSingletonScope();
    container.bind(TOKEN_GENERATOR_FACTORY_TOKEN).toFactory(JWTGenerator.New);
    const tokenGenerator = await container.get(TOKEN_GENERATOR_FACTORY_TOKEN)();
    container.bind(TOKEN_GENERATOR_TOKEN).toConstant(tokenGenerator);
}