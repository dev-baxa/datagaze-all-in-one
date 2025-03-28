import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TerminalService } from '../services/terminal.service';
import { ConnectToServerDto } from '../dto/connect-to-server.dto';

@WebSocketGateway({ cors: true , namespace: 'terminal' })
export class TerminalGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly terminalService: TerminalService) {}

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        client.emit('message', 'WebSocket connection established');
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.terminalService.disconnectClient(client.id);
    }

    @SubscribeMessage('connectToServer')
    async connectToServer(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: ConnectToServerDto,
    ) {
        await this.terminalService.connectToServer(client, payload);
    }

    @SubscribeMessage('terminalData')
    async handleTerminalData(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { data: string },
    ) {
        this.terminalService.handleTerminalData(client, payload.data);
    }
}
