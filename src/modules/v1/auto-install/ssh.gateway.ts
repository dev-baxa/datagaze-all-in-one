import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SshService } from './ssh.service';

@WebSocketGateway({namespace: 'ssh', cors: true })
export class SshGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly sshService: SshService) {}

    @SubscribeMessage('connect_ssh')
    handleSSHConnection(
        client: Socket,
        payload: { host: string; username: string; password: string },
    ) {
        this.sshService.connectSSH(client, payload.host, payload.username, payload.password);
    }

    @SubscribeMessage('terminal_data')
    handleTerminalData(client: Socket, payload: { command: string }) {
        this.sshService.runCommand(payload.command);
    }

    @SubscribeMessage('ssh_response')
    handleSSHResponse(client: Socket, payload: { response: string }) {
        this.sshService.handleUserInput(payload.response);
    }
}
