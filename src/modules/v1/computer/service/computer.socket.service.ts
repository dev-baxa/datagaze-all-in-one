import { Injectable, Logger, UseFilters } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// declare module 'socket.io' {
//     interface Socket {
//       user_id?: string;
//       computer_id?: string;
//     }
// }

import { WebsocketExceptionFilter } from 'src/common/filters/websocket.exception.filter';

@Injectable()
@UseFilters(new WebsocketExceptionFilter())
@WebSocketGateway({ cors: true, namespace: 'computer' })
export class ComputerWebSocketGatewat implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ComputerWebSocketGatewat.name);

    @WebSocketServer()
    server: Server;

    private userConnections: Map<string, Socket> = new Map();
    private computerConnections: Map<string, Socket> = new Map();

    constructor() {}

    async handleConnection(client: Socket) {
        const connectionType = client.handshake.query.connectionType as string;
        const id = client.handshake.query.id as string;

        if (!id) {
            this.logger.error('No id provided');
            client.disconnect();
            return;
        }

        if (connectionType === 'user') {
            this.logger.log('User connected');
          this.userConnections.set(id, client);
            client.emit('connection_success', 'User connected' );
        } else if (connectionType === 'computer') {
            this.logger.log('Computer connected');
          this.computerConnections.set(id, client);
            client.emit('connection_success', 'Computer connected' );
        } else {
            this.logger.error('Invalid connection type');
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        for (const [key, value] of this.userConnections) {
            if (value === client) {
                this.logger.log(`User disconnected: ${key}`);
                this.userConnections.delete(key);
                break;
            }
        }

        for (const [key, value] of this.computerConnections) {
            if (value === client) {
                this.logger.log(`Computer disconnected: ${key}`);
                this.computerConnections.delete(key);
                break;
            }
        }
    }

    @SubscribeMessage('user to computer')
    async userToComputer(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { computerId: string; message: string },
    ) {
        const { computerId, message } = payload;

        this.logger.log(`User (${client.id}) to computer message: ${JSON.stringify(message)}`);

      const computerConnection = this.computerConnections.get(computerId);

      const userId = client.handshake.query.id as string;
      

        if (computerConnection) {
            computerConnection.emit('command', {
                from: userId,
                command : message,
                timestamp: new Date().toISOString(),
            });
        } else {
            throw new WsException(`Computer (${computerId}) not found`);
        }
    }

    @SubscribeMessage('computer to user')
    async computerToUser(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string; response: any },
    ) {
        const { userId, response } = payload;

        this.logger.log(`Computer (${client.id}) to user message: ${JSON.stringify(response)}`);

      const userConnection = this.userConnections.get(userId);
      
      const clientId = client.handshake.query.id as string;

        if (userConnection) {
            userConnection.emit('response', {
                from: clientId,
                response,
                timestamp: new Date().toISOString(),
            });
        } else {
            client.emit('info', 'User now not connected');
        }
    }
}
