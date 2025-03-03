import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ServerModule } from '../server/server.module';
import { SshController } from './ssh.connection.controller';
import { SshConnectService } from './ssh.connection.service';
import { SshProductInstallService } from './services/ssh.product.install.service';

@Module({
    providers: [SshConnectService , SshProductInstallService],
    controllers: [SshController],
    exports: [SshConnectService],
    imports: [AuthModule, ServerModule],
})
export class SshModule {}
