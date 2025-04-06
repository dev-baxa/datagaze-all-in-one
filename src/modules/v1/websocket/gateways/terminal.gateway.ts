import { Logger } from '@nestjs/common';
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

import { ConnectToServerDto } from '../dto/connect-to-server.dto';
import { TerminalService } from '../services/terminal.service';

@WebSocketGateway({ cors: true, namespace: 'terminal' })
export class TerminalGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger = new Logger(TerminalGateway.name);
    @WebSocketServer()
    server: Server;

    constructor(private readonly terminalService: TerminalService) {}

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`);
        client.emit('message', 'WebSocket connection established');
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.terminalService.disconnectClient(client.id);
    }

    @SubscribeMessage('connectToServer')
    async connectToServer(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: ConnectToServerDto,
    ): Promise<void> {
        await this.terminalService.connectToServer(client, payload);
    }

    @SubscribeMessage('terminalData')
    async handleTerminalData(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { data: string },
    ): Promise<void> {
        this.terminalService.handleTerminalData(client, payload.data);
    }
}
