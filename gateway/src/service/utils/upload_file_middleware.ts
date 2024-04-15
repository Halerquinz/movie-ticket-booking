import { injected, token } from "brandi";
import { RequestHandler } from "express";
import { Multer } from "multer";
import { MULTER_MEMORY_STORAGE_INSTANCE_TOKEN } from "./multer_upload";

export class UploadField {
    constructor(public name: string, public maxCount: number) { }
}

export interface UploadFileMiddlewareFactory {
    getUploadMultipleFileMiddleware(uploadFields: UploadField[]): RequestHandler
}

export class UploadFileMiddlewareFactoryImpl implements UploadFileMiddlewareFactory {
    constructor(
        private readonly multerMemoryStorage: Multer
    ) { }

    public getUploadMultipleFileMiddleware(uploadFields: UploadField[]): RequestHandler {
        return this.multerMemoryStorage.fields(uploadFields);
    }
}

injected(UploadFileMiddlewareFactoryImpl, MULTER_MEMORY_STORAGE_INSTANCE_TOKEN);

export const UPLOAD_FILE_MIDDLEWARE_FACTORY = token<UploadFileMiddlewareFactory>("UploadFileMiddlewareFactory"); 