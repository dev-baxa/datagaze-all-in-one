import { Module } from '@nestjs/common';

import { AgentModule } from '../agent/AgentModule';
import { AuthModule } from '../auth/auth.module';
import { ComputerController } from './comp.controller';
import { ComputerService } from './comp.service';

@Module({
    imports: [AuthModule, AgentModule],
    providers: [ComputerService],
    exports: [ComputerService],
    controllers: [ComputerController],
})
export class ComputerModule {}
