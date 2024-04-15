import type { Knex } from "knex";


const TabNameBookingServiceBooking = "booking_service_booking_tab";
const TabNameBookingServiceBookingSeat = "booking_service_booking_seat_tab";
const TabNameBookingServicePayment = "booking_service_payment_tab";
const TabNameBookingServiceFeedback = "booking_service_feedback_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameBookingServiceBooking))) {
        await knex.schema.createTable(TabNameBookingServiceBooking, (table) => {
            table.increments("booking_id", { primaryKey: true });
            table.integer("of_user_id").notNullable();
            table.integer("of_showtime_id").notNullable();

            table.bigInteger("booking_time").notNullable();
            table.smallint("booking_status").notNullable();
            table.integer("amount").notNullable();

            table.index(["status"], "booking_service_booking_status_idx");
        });
    }


    if (!(await knex.schema.hasTable(TabNameBookingServiceBookingSeat))) {
        await knex.schema.createTable(TabNameBookingServiceBookingSeat, (table) => {
            table.increments("of_booking_id");
            table.integer("of_seat_id").notNullable();

            table.foreign("of_booking_id")
                .references("booking_id")
                .inTable(TabNameBookingServiceBooking);

            table.unique(["of_booking_id", "of_seat_id"], {
                indexName:
                    "booking_service_booking_seat_idx",
            });
        });
    }

    if (!(await knex.schema.hasTable(TabNameBookingServicePayment))) {
        await knex.schema.createTable(TabNameBookingServicePayment, (table) => {
            table.increments("payment_id", { primaryKey: true });
            table.integer("of_booking_id").notNullable();

            table.foreign("of_booking_id")
                .references("booking_id")
                .inTable(TabNameBookingServiceBooking)

            table.integer("amount").notNullable();
            table.smallint("payment_method").notNullable();
            table.bigInteger("payment_time").notNullable();
            table.smallint("payment_status").notNullable();

            table.index(["of_booking_id"], "booking_service_payment_of_booking_id_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameBookingServiceFeedback))) {
        await knex.schema.createTable(TabNameBookingServiceFeedback, (table) => {
            table.increments("feedback_id", { primaryKey: true });
            table.integer("of_booking_id").notNullable();
            table.integer("of_user_id").notNullable();

            table.foreign("of_booking_id")
                .references("booking_id")
                .inTable(TabNameBookingServiceBooking)

            table.string("comment", 256).notNullable();

            table.index(["of_booking_id"], "booking_service_feedback_of_booking_id_idx");
        });
    }
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameBookingServiceBooking);
    await knex.schema.dropTableIfExists(TabNameBookingServiceBookingSeat);
    await knex.schema.dropTableIfExists(TabNameBookingServiceFeedback);
    await knex.schema.dropTableIfExists(TabNameBookingServicePayment);
}

