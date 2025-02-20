import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/v1/auth/auth.module';
import { ServerModule } from './modules/v1/server/server.module';
import { SshModule } from './modules/v1/ssh-connection/ssh.connection.module';

@Module({
    imports: [AuthModule , ServerModule , SshModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
