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

    async handleConnection(client: Socket): Promise<void> {
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

    async handleDisconnect(client: Socket): Promise<void> {
        for (const [id, socket] of this.clientConnections.entries()) {
            if (socket.id === client.id) {
                this.clientConnections.delete(id);
                this.logger.log(`UI client disconnected: ${id}`);
                break;
            }
        }
    }

    @SubscribeMessage('delete_app')
    async handleDeleteApp(client: Socket, payload: { computerId: string; appName: string }):Promise<void> {
        this.logger.log(`Delete app request received: ${JSON.stringify(payload)}`);
        await this.agentGateway.executeCommandOnAgent(
            payload.computerId,
            payload.appName,
            'delete_app',
            client,
        );
    }

    @SubscribeMessage('install_app')
    async handleInstallApp(client: Socket, payload: { computerId: string; appName: string }):Promise<void> {
        this.logger.log(`Install app request received: ${JSON.stringify(payload)}`);
        await this.agentGateway.executeCommandOnAgent(
            payload.computerId,
            payload.appName,
            'install_app',
            client,
        );
    }

    @SubscribeMessage('update_app')
    async handleUpdateApp(client: Socket, payload: { computerId: string; appName: string }):Promise<void> {
        this.logger.log(`Update app request received: ${JSON.stringify(payload)}`);
        await this.agentGateway.executeCommandOnAgent(
            payload.computerId,
            payload.appName,
            'update_app',
            client,
        );
    }

    @SubscribeMessage('delete_agent')
    async handleDeleteAgent(client: Socket, payload: { computerId: string }):Promise<void> {
        this.logger.log(`Delete agent request received: ${JSON.stringify(payload)}`);
        await this.agentGateway.deleteAgent(payload.computerId, client);
    }
}
