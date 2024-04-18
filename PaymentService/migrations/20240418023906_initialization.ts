import type { Knex } from "knex";

const TabNameBookingServicePaymentTransaction = "booking_service_payment_transaction_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameBookingServicePaymentTransaction))) {
        await knex.schema.createTable(TabNameBookingServicePaymentTransaction, (table) => {
            table.increments("payment_transaction_id", { primaryKey: true });
            table.integer("of_booking_id").notNullable();

            table.integer("amount").notNullable();
            table.bigInteger("payment_time").notNullable();
            table.smallint("payment_status").notNullable();

            table.index(["of_booking_id"], "booking_service_payment_of_booking_id_idx");
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameBookingServicePaymentTransaction);
}

