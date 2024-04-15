import { Container } from "brandi";
import { IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN, ImageProtoToImageConverterImpl } from "./image_proto_to_image";
import { POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN, PosterProtoToPosterConverterImpl } from "./poster_proto_to_poster";

export * from "./image_proto_to_image";
export * from "./poster_proto_to_poster";

export function bindToContainer(container: Container): void {
    container.bind(IMAGE_PROTO_TO_IMAGE_CONVERTER_TOKEN).toInstance(ImageProtoToImageConverterImpl).inSingletonScope();
    container.bind(POSTER_PROTO_TO_POSTER_CONVERTER_TOKEN).toInstance(PosterProtoToPosterConverterImpl).inSingletonScope();
}