import { Injectable, Logger, UseFilters } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketExceptionFilter } from 'src/common/filters/websocket.exception.filter';
import { AgentAuthService } from './agent.auth.service';

@Injectable()
@UseFilters(new WebsocketExceptionFilter())
@WebSocketGateway(3501, { cors: { origin: '*' } })
export class AgentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AgentWebSocketGateway.name);

    constructor(private readonly authService: AgentAuthService) {}

    @WebSocketServer()
    server: Server;

    private agentConnections: Map<string, Socket> = new Map();

    async handleConnection(client: Socket) {
        const token = client.handshake.headers.authorization?.split(' ')[1] as string;
        if (!token) {
            this.logger.error(`No token provided: ${client.id}`);
            client.disconnect();
            return;
        }
        const payload = await this.authService.verifyToken(token);
        if (!payload) {
            this.logger.error(`No Payload: ${client.id}`);
            client.disconnect();
            return;
        }

        const agentId = payload.id;
        this.agentConnections.set(agentId, client);
        this.logger.log(`Agent connected: ${agentId}`);
        client.emit('status', 'Agent connected');
    }

    async handleDisconnect(client: Socket) {
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
    ) {
        const agentSocket = this.agentConnections.get(agentId);
        if (!agentSocket) {
            this.logger.error(`Agent not found: ${agentId}`);
            return uiClient.emit('response', {
                success: false,
                message: 'Agent not connected',
                appName,
                agentId,
            });
        }

        this.logger.log(`Sending ${command} command to agent ${agentId} for app: ${appName}`);
        agentSocket.emit('command', { command: command, name: appName });

        agentSocket.once('response', (data: { command: string; status: string; name: string }) => {
            this.logger.log(`Response from agent ${agentId}: ${JSON.stringify(data)}`);
            uiClient.emit('response', { ...data, agentId, appName });
        });
    }

    async deleteAgent(agentId: string, uiClient: Socket) { 
        const agentSocket = this.agentConnections.get(agentId);
        if (!agentSocket) {
            this.logger.error(`Agent not found: ${agentId}`);
            return uiClient.emit('response', {
                success: false,
                message: 'Agent not connected',
                agentId,
            });
        }

        this.logger.log(`Sending delete command to agent ${agentId}`);
        agentSocket.emit('delete_agent');

        agentSocket.once('delete_agent', (data: { message: string; status: string }) => {
            this.logger.log(`Response from agent ${agentId}: ${JSON.stringify(data)}`);
            uiClient.emit('response', { ...data, agentId });
        });
    }
}
