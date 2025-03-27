import { Module } from '@nestjs/common';
import { AgentModule } from './modules/v1/agent/agent.module';
import { AuthModule } from './modules/v1/auth/auth.module';
import { SshModule1 } from './modules/v1/auto-install/ssh.module';
import { ProductModule } from './modules/v1/product/product.module';
import { SshModule } from './modules/v1/ssh-connection/ssh.connection.module';
import { UserModule } from './modules/v1/user/user.module';
import { ComputerModule } from './modules/v1/computer/comp.module';

@Module({
    imports: [
        AuthModule,
        UserModule,
        SshModule,
        ProductModule,
        AgentModule,
        ComputerModule,
        SshModule1,
    ]
})
export class AppModule {}
