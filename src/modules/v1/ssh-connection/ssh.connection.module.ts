import { Module } from '@nestjs/common';

import { SshController } from './ssh.connection.controller';
import { SshConnectService } from './ssh.connection.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    providers: [SshConnectService],
    controllers: [SshController],
    exports: [SshConnectService],
    imports: [AuthModule],
})
export class SshModule {}
