import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SshController } from './ssh.connection.controller';
import { SshConnectService } from './ssh.connection.service';

@Module({
    providers: [SshConnectService],
    controllers: [SshController],
    exports: [SshConnectService],
    imports: [AuthModule],
})
export class SshModule {}
