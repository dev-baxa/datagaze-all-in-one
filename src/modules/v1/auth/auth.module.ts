import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from './redis.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService , RedisService],
    exports: [AuthService],
})
export class AuthModule {}
