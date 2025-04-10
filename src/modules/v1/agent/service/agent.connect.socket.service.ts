import { Injectable, Logger, UseFilters } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketExceptionFilter } from 'src/common/filters/websocket.exception.filter';
import db from 'src/config/database.config';

import { AgentAuthService } from './agent.auth.service';

@Injectable()
@UseFilters(new WebsocketExceptionFilter())
@WebSocketGateway(3501)
export class AgentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AgentWebSocketGateway.name);

    constructor(private readonly authService: AgentAuthService) {}

    @WebSocketServer()
    server: Server;

    private agentConnections: Map<string, Socket> = new Map();

    async handleConnection(client: Socket): Promise<void> {
        const token = client.handshake.headers.authorization?.split(' ')[1] as string;
        if (!token) {
            this.logger.error(`No token provided: ${client.id}`);
            client.disconnect();
            return;
        }

        const payload = await this.authService.verifyToken(token);
        if (!payload) {
            this.logger.error(`No IPayload: ${client.id}`);
            client.disconnect();
            return;
        }

        const isValidAgent = await db('computers').where('id', payload.id).first();
        if (!isValidAgent) {
            this.logger.error(`Invalid agent , agent not found: ${client.id}`);
            client.disconnect();
            return;
        }

        const agentId = payload.id;
        this.agentConnections.set(agentId, client);
        this.logger.log(`Agent connected: ${agentId}`);
        client.emit('status', 'Agent connected');
    }

    async handleDisconnect(client: Socket): Promise<void> {
        for (const [id, socket] of this.agentConnections.entries()) {
            if (socket.id === client.id) {
                this.agentConnections.delete(id);
                this.logger.log(`Agent disconnected: ${id}`);
                break;
            }
        }
    }

    async executeCommandOnAgent(
        agentId: string,
        appName: string,
        command: string,
        uiClient: Socket,
    ): Promise<void> {
        const agentSocket = this.agentConnections.get(agentId);
        if (!agentSocket) {
            this.logger.error(`Agent not found: ${agentId}`);
            uiClient.emit('response', {
                success: false,
                message: 'Agent not connected',
                appName,
                agentId,
            });
            return;
        }

        this.logger.log(`Sending ${command} command to agent ${agentId} for app: ${appName}`);
        agentSocket.emit('command', { command: command, name: appName });

        agentSocket.once('response', (data: { status: string; name: string }) => {
            this.logger.log(`Response from agent ${agentId}: ${JSON.stringify(data)}`);
            uiClient.emit('response', { ...data, agentId, command });
        });
    }

    async deleteAgent(agentId: string, uiClient: Socket): Promise<void> {
        const agentSocket = this.agentConnections.get(agentId);
        if (!agentSocket) {
            this.logger.error(`Agent not found: ${agentId}`);
            uiClient.emit('response', {
                success: false,
                message: 'Agent not connected',
                agentId,
            });
            return;
        }

        this.logger.log(`Sending delete command to agent ${agentId}`);
        agentSocket.emit('delete_agent');

        agentSocket.on('delete_agent', (data: { message: string; status: string }) => {
            this.logger.log(`Response from agent ${agentId}: ${JSON.stringify(data)}`);
            uiClient.emit('response', { ...data, agentId });
        });
    }
}
