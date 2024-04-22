import { Container } from "brandi";
import { KNEX_INSTANCE_TOKEN, newKnexInstance } from "./knex";
import { BOOKING_ACCESSOR_TOKEN, BookingDataAccessorImpl } from "./booking";

export * from "./knex";
export * from "./booking";

export function bindToContainer(container: Container): void {
    container.bind(KNEX_INSTANCE_TOKEN).toInstance(newKnexInstance).inSingletonScope();
    container.bind(BOOKING_ACCESSOR_TOKEN).toInstance(BookingDataAccessorImpl).inSingletonScope();
}