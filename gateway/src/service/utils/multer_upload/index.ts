import { Container } from "brandi";
import { MULTER_MEMORY_STORAGE_INSTANCE_TOKEN, getMulterMemoryStorage } from "./memory_storage";

export * from "./memory_storage";

export function bindToContainer(container: Container): void {
    container.bind(MULTER_MEMORY_STORAGE_INSTANCE_TOKEN).toInstance(getMulterMemoryStorage).inSingletonScope();
}