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
        agentSocket.emit('delete_app', { name : appName });

        // Agentdan javobni kutish
        agentSocket.once('deleted_app', ( command: string, status: string, name:string ) => {
            this.logger.log(`Delete result from agent ${agentId}: ${JSON.stringify({ command, status, name })}`);
            uiClient.emit('deleteAppResult', {
                command,
                status,
                name,
                agentId,
                appName,
            });
        });
    }

    async installAppOnAgent(agentId: string, appName: string, uiClient: Socket) {
        const agentSocket = this.agentConnections.get(agentId);

        if (!agentSocket) {
            this.logger.error(`Agent not found: ${agentId}`);
            uiClient.emit('installAppResult', {
                success: false,
                message: 'Agent not connected',
                appName,
                agentId,
            });
            return;
        }

        this.logger.log(`Sending install command to agent ${agentId} for app: ${appName}`);
        agentSocket.emit('install_app', { name : appName });    

        // Agentdan javobni kutish
        agentSocket.once('installed_app', (command: string, status: string, name: string) => {
            console.log(command)
            this.logger.log(`Install result from agent ${agentId}: ${JSON.stringify({ command, status, name })}`);
            uiClient.emit('installAppResult', {
                command,
                // status,
                // name,
                // agentId,
                // appName,
            });
        });
    }
}
