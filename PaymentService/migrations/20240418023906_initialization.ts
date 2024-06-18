import type { Knex } from "knex";

const TabNameBookingServicePaymentTransaction = "payment_service_payment_transaction_tab";
const TabNameBookingServiceCheckoutSession = "payment_service_checkout_session_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameBookingServicePaymentTransaction))) {
        await knex.schema.createTable(TabNameBookingServicePaymentTransaction, (table) => {
            table.increments("payment_transaction_id", { primaryKey: true });
            table.integer("of_booking_id").notNullable();

            table.smallint("status").notNullable();
            table.bigInteger("request_time").notNullable();
            table.bigInteger("update_time").notNullable().defaultTo(0);

            table.index(["of_booking_id", "status"], "payment_service_payment_transaction_of_booking_status_idx");
            table.index(["request_time"], "payment_service_payment_transaction_request_time_idx");
            table.index(["update_time"], "payment_service_payment_transaction_update_time_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameBookingServiceCheckoutSession))) {
        await knex.schema.createTable(TabNameBookingServiceCheckoutSession, (table) => {
            table.integer("of_payment_transaction_id");

            table.string("checkout_session_id", 256);
            table.text("url");

            table.foreign("of_payment_transaction_id")
                .references("payment_transaction_id")
                .inTable(TabNameBookingServicePaymentTransaction);

            table.primary(["of_payment_transaction_id"]);
            table.unique(["of_payment_transaction_id", "checkout_session_id"], {
                indexName:
                    "payment_service_payment_transaction_idx",
            });

            table.index(["url"], "payment_service_checkout_session_url_idx");
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameBookingServicePaymentTransaction);
    await knex.schema.dropTableIfExists(TabNameBookingServiceCheckoutSession);
}

