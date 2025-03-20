import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentAuthService } from './service/agent.auth.service';
import { AgentWebSocketGateway } from './service/agent.connect.socket.service';
import { UIWebSocketGateway } from './service/user.connect.socket.service';
import { WebsocketExceptionFilter } from 'src/common/filters/websocket.exception.filter';
import { FileController } from './agent.file.controller';

@Module({
    providers: [AgentService, AgentAuthService ,  AgentWebSocketGateway, UIWebSocketGateway , WebsocketExceptionFilter],
    exports: [AgentService, AgentAuthService , AgentWebSocketGateway],
    controllers: [AgentController , FileController],
})
export class ComputerModule {}
