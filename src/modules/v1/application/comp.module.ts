import { Module } from '@nestjs/common';

import { ComputerController } from './comp.controller';
import { ComputerService } from './comp.service';
import { AgentModule } from '../agent/agent.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule, AgentModule],
    providers: [ComputerService],
    exports: [ComputerService],
    controllers: [ComputerController],
})
export class ComputerModule {}
