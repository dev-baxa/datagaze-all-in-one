import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);
    private redisClient;
    constructor() {
        this.redisClient = createClient({ socket: { host: 'localhost', port: 6379 } });
        this.redisClient.connect();
        this.redisClient.on('error', err => this.logger.error('Redis xatosi:', err.message));
    }
    async set(key: string, value: string, ttlInSeconds: number): Promise<void> {
        await this.redisClient.set(key, value, { EX: ttlInSeconds });
    }

    async get(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    async delete(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }
}
