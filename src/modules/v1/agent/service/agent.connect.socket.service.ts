import { Injectable, Logger, UseFilters } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
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
            this.logger.error(`No token provided:   ${client.id}`);
            client.disconnect();
            return
        }
        const payload = await this.authService.verifyToken(token);

        if (!payload) {
            this.logger.error(`No Payload:   ${client.id}`);
            client.disconnect();
            return;
        }

        const agentId = payload.id;
        this.agentConnections.set(agentId, client);
        this.logger.log(`Agent connected: ${agentId}`);
        client.emit('status', 'Agent connected');
    }

    async handleDisconnect(client: Socket) {
        // this.logger.log(`Agent disconnected: ${client.id}`);

        for (const [id, socket] of this.agentConnections.entries()) {
            if (socket.id === client.id) {
                this.agentConnections.delete(id);
                this.logger.log(`Agent disconnected: ${id}`);
                break;
            }
        }
    }

    async deleteAppOnAgent(agentId: string, appName: string, uiClient: Socket) {
        const agentSocket = this.agentConnections.get(agentId);

        if (!agentSocket) {
            this.logger.error(`Agent not found: ${agentId}`);

            uiClient.emit('deleteAppResult', {
                success: false,
                message: 'Agent not connected',
                appName,
                agentId,
            });
            return;
        }
        this.logger.log(`Sending delete command to agent ${agentId} for app: ${appName}`);
        agentSocket.emit('deleteApp', { appName });
    }

    @SubscribeMessage('deleteAppResult')
    handleDeleteAppResult(
        client: Socket,
        payload: { success: boolean; appName: string; message?: string },
    ) {
        this.logger.log(`Delete result received from agent: ${JSON.stringify(payload)}`);

        // Find the agent ID associated with this socket
        let agentId: string | undefined;
        for (const [id, socket] of this.agentConnections.entries()) {
            if (socket.id === client.id) {
                agentId = id;
                break;
            }
        }

        if (!agentId) {
            this.logger.error('Could not identify agent ID for deletion result');
            return;
        }

        // Broadcast to UI clients (you might want to make this more targeted)
        this.server.of('computer').emit('deleteAppResult', {
            ...payload,
            agentId,
        });
    }
}
