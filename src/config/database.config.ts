import { join } from 'path';

import * as dotenv from 'dotenv';
import knex, { Knex } from 'knex';

dotenv.config({
    path: join(process.cwd(), '.env'),
});

const config: Knex.Config = {
    client: 'pg',
    debug: true,
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD?.toString(),
    },
    pool: {
        min: 2,
        max: process.env.NODE_ENV === 'production' ? 20 : 10,
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
};

const db = knex(config);

export default db;
