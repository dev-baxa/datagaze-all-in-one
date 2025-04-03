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

    handleConnection(client: Socket) {
        this.sshService.handleConnection(client);
    }

    handleDisconnect(client: Socket) {
        this.sshService.handleDisconnect(client);
    }

    @SubscribeMessage('connect_ssh')
    handleSSHConnection(client: Socket, payload: { productId: string }) {
        this.sshService.connectSSH(client, payload.productId);
    }

    @SubscribeMessage('install')
    async handleInstalData(client: Socket, payload: { productId: string }) {
        const install_scripts = await this.sshService.getInstallScript(payload.productId);
        this.handleTerminalData(client, { data: install_scripts });
    }

    @SubscribeMessage('terminal_data')
    handleTerminalData(client: Socket, payload: { data: string }) {
        this.sshService.runCommand(client, payload.data);
    }
}
