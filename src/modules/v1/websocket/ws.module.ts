import { Module } from '@nestjs/common';

import { SshProductInstallGateway } from './gateways/connect.gateway';
import { OperationsGateway } from './gateways/operatsion.gateway';
import { TerminalGateway } from './gateways/terminal.gateway';
import { TerminalService } from './services/terminal.service';
import { AuthModule } from '../auth/auth.module';
import { SshProductInstallService } from './services/connect.and.file.upload.service';
import { OperationsService } from './services/operation.service';

@Module({
    imports: [AuthModule],
    providers: [
        TerminalGateway,
        TerminalService,
        SshProductInstallGateway,
        SshProductInstallService,
        OperationsGateway,
        OperationsService,
    ],
    exports: [TerminalService, SshProductInstallService],
})
export class WebSocketModule {}
