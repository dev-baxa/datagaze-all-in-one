import { Injectable, Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentAuthService } from './agent.auth.service';
import { AgentWebSocketGateway } from './agent.connect.socket.service';

@Injectable()
@WebSocketGateway({ namespace: 'computer', cors: true })
export class UIWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(UIWebSocketGateway.name);

    constructor(
        private readonly authService: AgentAuthService,
        private readonly agentGateway: AgentWebSocketGateway,
    ) {}

    @WebSocketServer()
    server: Server;

    private clientConnections: Map<string, Socket> = new Map();

    async handleConnection(client: Socket) {
        const token = client.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            client.disconnect();
            throw new WsException('Unauthorized');
        }

        const payload = await this.authService.verifyToken(token);
        if (!payload) {
            client.disconnect();
            throw new WsException('Unauthorized');
        }

        const clientId = payload.id;
        this.clientConnections.set(clientId, client);
        this.logger.log(`UI client connected: ${clientId}`);
        client.emit('connection_success', 'UI client connected');
    }

    async handleDisconnect(client: Socket) {
        for (const [id, socket] of this.clientConnections.entries()) {
            if (socket.id === client.id) {
                this.clientConnections.delete(id);
                this.logger.log(`UI client disconnected: ${id}`);
                break;
            }
        }
    }

    @SubscribeMessage('delete_app')
    handleDeleteApp(client: Socket, payload: { computerId: string; appName: string }) {
        this.logger.log(`Delete app request received: ${JSON.stringify(payload)}`);
        this.agentGateway.deleteAppOnAgent(payload.computerId, payload.appName, client);
        return { success: true, message: 'Delete command sent to agent' };
    }

    @SubscribeMessage('install_app')
    handleInstallApp(client: Socket, payload: { computerId: string; appName: string }) {
        this.logger.log(`Install app request received: ${JSON.stringify(payload)}`);
        this.agentGateway.installAppOnAgent(payload.computerId, payload.appName, client);
        return { success: true, message: 'Install command sent to agent' };
    }
}
