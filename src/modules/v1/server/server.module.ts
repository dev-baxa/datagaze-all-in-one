import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';

@Module({
    controllers: [ServerController],
    providers: [ServerService],
    exports: [ServerService],
})
export class ServerModule {}
