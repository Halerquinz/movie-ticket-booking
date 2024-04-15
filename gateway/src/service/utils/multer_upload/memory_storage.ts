import { injected, token } from "brandi";
import multer, { Multer } from "multer";

export function getMulterMemoryStorage(): Multer {
    const storage = multer.memoryStorage();
    return multer({ storage: storage });
}

injected(getMulterMemoryStorage);

export const MULTER_MEMORY_STORAGE_INSTANCE_TOKEN = token<Multer>("MulterMemoryStorage");