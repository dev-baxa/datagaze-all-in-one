import knex from 'knex';
import knexConfig from '../database/knexfile';

const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

export default db;

// import {Knex} from 'knex';
// import {config} from 'dotenv';
// import {join} from 'path';

// config({path: join(__dirname, '../../.env')});

// const knexConfig: { [key: string]: Knex.Config } = {
//     development: {
//         client: 'pg',
//         connection: {
//             host: process.env.DB_HOST,
//             port: Number(process.env.DB_PORT),
//             database: process.env.DB_NAME,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD,
//         },
//         pool: {
//             min: 2,
//             max: 10,
//         },
//         migrations: {
//             directory: join(__dirname, '../database/migrations'),
//             extension: 'ts',
//         },
//         seeds: {
//             directory: join(__dirname, '../database/seeds'),
//             extension: 'ts',
//         },
//     },

//     production: {
//         client: 'pg',
//         connection: {
//             host: process.env.DB_HOST,
//             port: Number(process.env.DB_PORT),
//             database: process.env.DB_NAME,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD,
//         },
//         pool: {
//             min: 2,
//             max: 10,
//         },
//         migrations: {
//             directory: join(__dirname, '../database/migrations'),
//             extension: 'ts',
//         },
//         seeds: {
//             directory: join(__dirname, '../database/seeds'),
//             extension: 'ts',
//         },
//     },
// };

// export default knexConfig;
