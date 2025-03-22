import { Module } from '@nestjs/common';
import { SshGateway } from './ssh.gateway';
import { SshService } from './ssh.service';

@Module({
    providers: [SshGateway, SshService],
})
export class SshModule1 {}
