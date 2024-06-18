import type { Knex } from "knex";

const TabNameBookingServiceBooking = "booking_service_booking_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameBookingServiceBooking))) {
        await knex.schema.createTable(TabNameBookingServiceBooking, (table) => {
            table.increments("booking_id", { primaryKey: true });
            table.integer("of_user_id").notNullable();
            table.integer("of_showtime_id").notNullable();
            table.integer("of_seat_id").notNullable();

            table.bigInteger("booking_time").notNullable();
            table.smallint("booking_status").notNullable().defaultTo(0);
            table.bigInteger("amount").unsigned().notNullable();
            table.specificType("currency", "char(3)").notNullable();

            table.unique(["of_showtime_id", "of_seat_id", "booking_time"]);

            table.index(["booking_status", "of_seat_id", "of_showtime_id"], "booking_service_booking_seat_with_status_idx");
            table.index(["booking_status", "of_user_id"], "booking_service_booking_of_user_id_idx");
            table.index(["booking_status"], "booking_service_booking_status_idx");
        });
    }
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameBookingServiceBooking);
}
