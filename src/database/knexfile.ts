// src/database/knexfile.ts
import { join } from 'path';
import type { Knex } from 'knex';
import * as dotenv from 'dotenv'

// console.log(join(__dirname, '../../../.env'));
// console.log(__filename);


dotenv.config({
    path: join(__dirname, '../../../.env')
})


const knexConfig: { [key: string]: Knex.Config } = {
    development: {
        debug: true,
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD?.toString(),
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
            host: process.env.DB_HOST || 'localhost',       
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD?.toString(),
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
