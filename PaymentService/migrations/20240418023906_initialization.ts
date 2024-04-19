import type { Knex } from "knex";

const TabNameBookingServicePaymentTransaction = "booking_service_payment_transaction_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameBookingServicePaymentTransaction))) {
        await knex.schema.createTable(TabNameBookingServicePaymentTransaction, (table) => {
            table.increments("payment_transaction_id", { primaryKey: true });
            table.integer("of_booking_id").notNullable();

            table.integer("amount").notNullable();
            table.smallint("status").notNullable();
            table.bigInteger("request_time").notNullable();
            table.bigInteger("update_time").notNullable().defaultTo(0);

            table.index(["of_booking_id", "status"], "payment_service_payment_transaction_of_booking_status_idx");
            table.index(["request_time"], "payment_service_payment_transaction_request_time_idx");
            table.index(["update_time"], "payment_service_payment_transaction_update_time_idx");
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameBookingServicePaymentTransaction);
}

