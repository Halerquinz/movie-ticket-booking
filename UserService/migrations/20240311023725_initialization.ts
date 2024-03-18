import type { Knex } from "knex";

const TabNameUserServiceUser = "user_service_user_tab";
const TabNameUserServiceTokenPublicKey = "user_service_token_public_key_tab";
const TabNameUserServiceBlacklistedToken = "user_service_blacklisted_token_tab";
const TabNameUserServicePassword = "user_service_password_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameUserServiceUser))) {
        await knex.schema.createTable(TabNameUserServiceUser, function (table) {
            table.increments("user_id", { primaryKey: true });
            table.string('username', 64).notNullable().unique();
            table.string('display_name', 256).notNullable();

            table.index(["username"], "user_service_user_username_idx");
            table.index(["display_name"], "user_service_user_display_name_idx");
        })
    }

    if (!(await knex.schema.hasTable(TabNameUserServicePassword))) {
        await knex.schema.createTable(TabNameUserServicePassword, function (table) {
            table.integer("of_user_id");
            table.string('hash', 256).notNullable();

            table.primary(["of_user_id"]);
            table.foreign("of_user_id").references("user_id").inTable(TabNameUserServiceUser);
        })
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceTokenPublicKey))) {
        await knex.schema.createTable(TabNameUserServiceTokenPublicKey, (table) => {
            table.increments("public_key_id", { primaryKey: true });
            table.text("data").notNullable();
        })
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceBlacklistedToken))) {
        await knex.schema.createTable(
            TabNameUserServiceBlacklistedToken,
            (tab) => {
                tab.bigInteger("token_id").notNullable();
                tab.bigInteger("expire_at").notNullable();

                tab.primary(["token_id"]);
                tab.index(
                    ["expire_at"],
                    "user_service_blacklisted_token_expire_idx"
                );
            }
        );
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameUserServiceUser);
    await knex.schema.dropTableIfExists(TabNameUserServicePassword);
    await knex.schema.dropTableIfExists(TabNameUserServiceTokenPublicKey);
    await knex.schema.dropTableIfExists(TabNameUserServiceBlacklistedToken);
}

