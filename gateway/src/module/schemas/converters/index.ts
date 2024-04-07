import { Container } from "brandi";
import { IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN, ImageProtoToImageConverterImpl } from "./image_proto_to_image";

export * from "./image_proto_to_image";

export function bindToContainer(container: Container): void {
    container.bind(IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN).toInstance(ImageProtoToImageConverterImpl).inSingletonScope();
}