import { Module } from '@nestjs/common';
import { SshGateway } from './ssh.gateway';
import { SshService } from './ssh.service';
import { ProductInstallGateway } from './auto_install';

@Module({
    providers: [SshGateway, SshService, ProductInstallGateway],
})
export class SshModule1 {}
