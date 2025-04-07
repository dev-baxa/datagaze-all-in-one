import * as path from 'path';

import * as dotenv from 'dotenv';

dotenv.config({
    path: path.join(process.cwd(), '.env'),
});

interface IEnvConfig {
    PORT: string | undefined;
    PORT_FOR_AGENT: string | undefined;
    HOST: string | undefined;
    DB_HOST: string | undefined;
    DB_PORT: string | undefined;
    DB_USER: string | undefined;
    DB_PASSWORD: string | undefined;
    DB_NAME: string | undefined;
    JWT_PRIVAT_KEY: string | undefined;
    NODE_ENV: string | undefined;
    JWT_PUBLIC_KEY: string | undefined;
    REDIS_PORT: string | undefined;
}

export const env: IEnvConfig = {
    PORT: process.env.PORT,
    PORT_FOR_AGENT: process.env.PORT_FOR_AGENT,
    HOST: process.env.HOST,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    JWT_PRIVAT_KEY: process.env.JWT_PRIVATE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
    REDIS_PORT: process.env.REDIS_PORT,
};
