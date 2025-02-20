// src/database/knexfile.ts
import { config } from 'dotenv';
import { join } from 'path';
import type { Knex } from 'knex';
import { ENV } from 'src/config/env';

// .env faylini yuklash
config({ path: join(__dirname, '../../.env') });

const knexConfig: { [key: string]: Knex.Config } = {
    development: {
        debug: true,
        client: 'pg',
        connection: {
            host: ENV.DB_HOST || 'localhost',
            port: Number(ENV.DB_PORT) || 5432,
            database: ENV.DB_NAME,
            user: ENV.DB_USER,
            password: ENV.DB_PASSWORD?.toString(),
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: join(__dirname, './migrations/v1'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
        seeds: {
            directory: join(__dirname, './seeds/v1'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
    },

    production: {
        client: 'pg',
        connection: {
            host: ENV.DB_HOST || 'localhost',
            port: Number(ENV.DB_PORT) || 5432,
            database: ENV.DB_NAME,
            user: ENV.DB_USER,
            password: ENV.DB_PASSWORD?.toString(),
        },
        pool: {
            min: 2,
            max: 20,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: join(__dirname, './migrations/v1'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
        seeds: {
            directory: join(__dirname, './seeds/v1'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
    },
};

export default knexConfig;
