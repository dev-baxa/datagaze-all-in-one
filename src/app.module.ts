import { Module } from '@nestjs/common';

import { AgentModule } from './modules/v1/agent/AgentModule';
import { ComputerModule } from './modules/v1/application/comp.module';
import { AuthModule } from './modules/v1/auth/auth.module';
import { ProductModule } from './modules/v1/product/product.module';
import { SshModule } from './modules/v1/ssh-connection/ssh.connection.module';
import { UserModule } from './modules/v1/user/user.module';
import { WebSocketModule } from './modules/v1/websocket/ws.module';

@Module({
    imports: [
        AuthModule,
        UserModule,
        SshModule,
        ProductModule,
        AgentModule,
        ComputerModule,
        WebSocketModule,
    ],
})
export class AppModule {}
