import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentAuthService } from './service/agent.auth.service';
import { ComputerWebSocketGatewat } from './service/computer.socket.service';

@Module({
    providers: [AgentService, AgentAuthService, ComputerWebSocketGatewat],
    exports: [AgentService],
    controllers: [AgentController],
})
export class ComputerModule {}
