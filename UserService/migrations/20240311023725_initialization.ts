import type { Knex } from "knex";

const TabNameUserServiceUser = "user_service_user_tab";
const TabNameUserServiceUserRole = "user_service_user_role_tab";
const TabNameUserServiceUserPermission = "user_service_user_permission_tab";
const TabNameUserServiceUserHasUserRole = "user_service_user_has_user_role_tab";
const TabNameUserServiceUserRoleHasUserPermission = "user_service_user_role_has_user_permission_tab";
const TabNameUserServiceTokenPublicKey = "user_service_token_public_key_tab";
const TabNameUserServiceBlacklistedToken = "user_service_blacklisted_token_tab";
const TabNameUserServicePassword = "user_service_password_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameUserServiceUser))) {
        await knex.schema.createTable(TabNameUserServiceUser, (table) => {
            table.increments("user_id", { primaryKey: true });
            table.string('username', 64).notNullable().unique();
            table.string('display_name', 256).notNullable();

            table.index(["username"], "user_service_user_username_idx");
            table.index(["display_name"], "user_service_user_display_name_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserRole))) {
        await knex.schema.createTable(TabNameUserServiceUserRole, (table) => {
            table.increments("user_role_id", { primaryKey: true });
            table.string("display_name", 256).notNullable();
            table.string("description", 256).notNullable();

            table.index(["display_name"], "user_service_user_role_display_name_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserPermission))) {
        await knex.schema.createTable(TabNameUserServiceUserPermission, (table) => {
            table.increments("user_permission_id", { primaryKey: true });
            table.string("permission_name", 256).notNullable().unique();
            table.string("description", 256).notNullable();

            table.index(["permission_name"], "user_service_user_permission_permission_name_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserHasUserRole))) {
        await knex.schema.createTable(TabNameUserServiceUserHasUserRole, (table) => {
            table.integer("user_id").notNullable();
            table.integer("user_role_id").notNullable();

            table.foreign("user_id")
                .references("user_id")
                .inTable(TabNameUserServiceUser);
            table.foreign("user_role_id")
                .references("user_role_id")
                .inTable(TabNameUserServiceUserRole)
                .onDelete("CASCADE");

            table.unique(["user_id", "user_role_id"]);
            table.index(["user_id"], "user_service_user_has_user_role_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceUserRoleHasUserPermission))) {
        await knex.schema.createTable(TabNameUserServiceUserRoleHasUserPermission, (table) => {
            table.integer("user_role_id").notNullable();
            table.integer("user_permission_id").notNullable();

            table.foreign("user_role_id")
                .references("user_role_id")
                .inTable(TabNameUserServiceUserRole)
                .onDelete("CASCADE");
            table.foreign("user_permission_id")
                .references("user_permission_id")
                .inTable(TabNameUserServiceUserPermission)
                .onDelete("CASCADE");

            table.unique(["user_role_id", "user_permission_id"]);
            table.index(
                ["user_role_id"],
                "user_service_user_role_has_user_permission_idx"
            );
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServicePassword))) {
        await knex.schema.createTable(TabNameUserServicePassword, (table) => {
            table.integer("of_user_id");
            table.string('hash', 256).notNullable();

            table.primary(["of_user_id"]);
            table.foreign("of_user_id").references("user_id").inTable(TabNameUserServiceUser);
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceTokenPublicKey))) {
        await knex.schema.createTable(TabNameUserServiceTokenPublicKey, (table) => {
            table.increments("public_key_id", { primaryKey: true });
            table.text("data").notNullable();
        });
    }

    if (!(await knex.schema.hasTable(TabNameUserServiceBlacklistedToken))) {
        await knex.schema.createTable(TabNameUserServiceBlacklistedToken, (table) => {
            table.bigInteger("token_id").notNullable();
            table.bigInteger("expire_at").notNullable();

            table.primary(["token_id"]);
            table.index(
                ["expire_at"],
                "user_service_blacklisted_token_expire_idx"
            );
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameUserServiceUser);
    await knex.schema.dropTableIfExists(TabNameUserServicePassword);
    await knex.schema.dropTableIfExists(TabNameUserServiceTokenPublicKey);
    await knex.schema.dropTableIfExists(TabNameUserServiceBlacklistedToken);
}

