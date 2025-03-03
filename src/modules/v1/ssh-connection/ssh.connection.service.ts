import { Injectable } from '@nestjs/common';
import { User } from '../auth/entities/user.interface';
import { installDto } from './dto/product.install.dto';
import { ConnectionDTO } from './dto/ssh.connection.dto';
import { SshConnectToServer } from './services/ssh.connect.service';
import { SshExecuteService } from './services/ssh.execute.service';
import { SshProductInstallService } from './services/ssh.product.install.service';

@Injectable()
export class SshConnectService {
    // private connectConfig2: ConnectConfigInterface;
    constructor(
        private readonly sshProductInstallService: SshProductInstallService,
        private readonly sshExecuteInServer: SshExecuteService,
        private readonly sshConnectToServer: SshConnectToServer,
    ) {}

    public async loadServerConfig(productId: string) {
        await this.sshExecuteInServer.loadServerConfig(productId);
    }

    async connectToServerCheck(data: ConnectionDTO, user: User): Promise<object> {
        return await this.sshConnectToServer.connectToServerCheck(data, user);
    }

    async executeInServer(command: string): Promise<object> {
        return await this.sshExecuteInServer.executeInServer(command);
    }
    async installProductInServer(data: installDto, user: User): Promise<object> {
        return await this.sshProductInstallService.installProduct(data, user);
    }
}
