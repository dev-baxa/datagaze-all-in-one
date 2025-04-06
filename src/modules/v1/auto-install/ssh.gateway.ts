import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { SshService } from './ssh.service';

@WebSocketGateway({ namespace: 'ssh', cors: true })
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly sshService: SshService) {}

    handleConnection(client: Socket):void {
        this.sshService.handleConnection(client);
    }

    handleDisconnect(client: Socket):void {
        this.sshService.handleDisconnect(client);
    }

    @SubscribeMessage('connect_ssh')
    async handleSSHConnection(client: Socket, payload: { productId: string }) :Promise<void> {
        await this.sshService.connectSSH(client, payload.productId);
    }

    @SubscribeMessage('install')
    async handleInstalData(client: Socket, payload: { productId: string }):Promise<void> {
        const installScripts = await this.sshService.getInstallScript(payload.productId);
        await this.handleTerminalData(client, { data: installScripts });
    }

    @SubscribeMessage('terminal_data')
    async handleTerminalData(client: Socket, payload: { data: string }) :Promise<void> {
       await this.sshService.runCommand(client, payload.data);
    }
}
