import { join } from 'path/posix';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { WebsocketExceptionFilter } from 'src/common/filters/websocket.exception.filter';
import { AgentAuthMiddleware } from 'src/common/middlewares/computer.auth.middleware';

import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentAuthService } from './service/agent.auth.service';
import { AgentWebSocketGateway } from './service/agent.connect.socket.service';
import { UIWebSocketGateway } from './service/user.connect.socket.service';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads', 'applications'),
            serveRoot: '/agents',
        }),
    ],
    providers: [
        AgentService,
        AgentAuthService,
        AgentWebSocketGateway,
        UIWebSocketGateway,
        WebsocketExceptionFilter,
    ],
    exports: [AgentService, AgentAuthService, AgentWebSocketGateway],
    controllers: [AgentController],
})
export class AgentModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AgentAuthMiddleware).forRoutes('/agents/');
    }
}
