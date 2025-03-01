import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import { Server } from './entities/server.interface';
import { SshConnectService } from '../ssh-connection/ssh.connection.service';

@Injectable()
export class ServerService extends BaseService<Server> {
    constructor() {
        super('servers');
    }
}
