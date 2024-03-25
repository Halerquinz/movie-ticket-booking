import { injected, token } from "brandi";
import knex, { Knex } from "knex";
import { DatabaseConfig, DATABASE_CONFIG_TOKEN } from "../../config";

export function newKnexInstance(databaseConfig: DatabaseConfig): Knex {
    return knex({
        client: "pg",
        connection: {
            host: databaseConfig.host,
            port: databaseConfig.port,
            user: databaseConfig.user,
            password: databaseConfig.password,
            database: databaseConfig.database,
        },
    });
}

injected(newKnexInstance, DATABASE_CONFIG_TOKEN);

export const KNEX_INSTANCE_TOKEN = token<Knex>("Knex");
