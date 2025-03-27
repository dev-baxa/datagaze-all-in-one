import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SshController } from './ssh.connection.controller';
import { SshConnectService } from './ssh.connection.service';
import { SshProductInstallService } from './services/ssh.product.install.service';
import { SshExecuteService } from './services/ssh.execute.service';
import { SshConnectToServer } from './services/ssh.connect.service';
import { SshGateway } from './services/ssh.websocket.service';

@Module({
    providers: [SshConnectService , SshProductInstallService , SshExecuteService  , SshConnectToServer , SshGateway],
    controllers: [SshController],
    exports: [SshConnectService],
    imports: [AuthModule],
})
export class SshModule {}
