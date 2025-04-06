import { Module } from '@nestjs/common';

import { ProductInstallGateway } from './auto_install';
import { SshGateway } from './ssh.gateway';
import { SshService } from './ssh.service';

@Module({
    providers: [SshGateway, SshService, ProductInstallGateway],
})
export class SshModule1 {}
