import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import { ServerInterface } from './entities/server.interface';
import { SshConnectService } from '../ssh-connection/ssh.connection.service';

@Injectable()
export class ServerService extends BaseService<ServerInterface> {
    constructor() {
        super('servers');
    }
}
