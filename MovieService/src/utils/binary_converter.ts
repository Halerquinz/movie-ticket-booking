import { injected, token } from "brandi";

export interface BinaryConverter {
    toBuffer<T = any>(data: T): Buffer;
    fromBuffer<T = any>(buffer: Buffer): T | null;
}

export class BinaryConverterImpl implements BinaryConverter {
    public fromBuffer<T = any>(buffer: Buffer): T | null {
        const jsonStr = buffer.toString();
        if (jsonStr === "") {
            return null;
        }
        return JSON.parse(jsonStr);
    }

    public toBuffer<T = any>(data: T): Buffer {
        return Buffer.from(JSON.stringify(data));
    }
}

injected(BinaryConverterImpl);

export const BINARY_CONVERTER_TOKEN = token<BinaryConverter>("BinaryConverter");