// src/database/knexfile.ts
import * as dotenv from 'dotenv';
import knex from 'knex';
import { join } from 'path';

dotenv.config({
    path: join(__dirname, '../../.env'),
});

const knexConfig: { [key: string]: knex.Knex.Config } = {
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
            loadExtensions: ['.js'],
        },
        seeds: {
            directory: join(__dirname, './seeds/v1'),
            extension: 'ts',
            loadExtensions: ['.js'],
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
            loadExtensions: ['.js'],
        },
        seeds: {
            directory: join(__dirname, './seeds/v1'),
            extension: 'ts',
            loadExtensions: ['.js'],
        },
    },
};

export default knexConfig;
