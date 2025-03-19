import { Injectable, Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentAuthService } from './agent.auth.service';

@Injectable()
@WebSocketGateway(3501, {  cors: {origin : '*'} })
export class AgentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(AgentWebSocketGateway.name);

    constructor(private readonly authService: AgentAuthService) {}

    @WebSocketServer()
    server: Server;

    private agentConnections: Map<string, Socket> = new Map();

    async handleConnection(client: Socket) {
        // const token = client.handshake.headers.authorization?.split(' ')[1];

        // if (!token) {
        //     client.disconnect();
        //     throw new WsException('Unauthorized');
        // }

        // const payload = await this.authService.verifyToken(token);

        // if (!payload) {
        //     client.disconnect();
        //     throw new WsException('Unauthorized');
        // }

        // const agentId = payload.id;
        // this.agentConnections.set(agentId, client);
        this.logger.log(`Agent connected: ${client.id}`);

      client.emit('data', { message: 'Agent connected' });
    }

  async handleDisconnect(client: Socket) {
        this.logger.log(`Agent disconnected: ${client.id}`);
      
        // for (const [id, socket] of this.agentConnections.entries()) {
        //     if (socket.id === client.id) {
        //         this.agentConnections.delete(id);
        //         this.logger.log(`Agent disconnected: ${id}`);
        //         break;
        //     }
        // }
    }
}
