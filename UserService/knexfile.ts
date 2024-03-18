/* eslint-disable */
const dotenv = require("dotenv");
dotenv.config();

const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PORT = +(process.env.POSTGRES_PORT || 5432);
const POSTGRES_DB = process.env.POSTGRES_DB;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
    },
    pool: {
      min: 2,
      max: 4,
    },
    migrations: {
      tableName: "knex_migrations",
      loadExtensions: [".ts"],
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
    },
    pool: {
      min: 2,
      max: 4,
    },
    migrations: {
      tableName: "knex_migrations",
      loadExtensions: [".ts"],
    },
  },

  production: {
    client: "postgresql",
    connection: {
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
    },
    pool: {
      min: 2,
      max: 4,
    },
    migrations: {
      tableName: "knex_migrations",
      loadExtensions: [".ts"],
    },
  },
};

