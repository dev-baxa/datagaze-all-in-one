import {
  MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }
  
  async handleDisconnect(client: Socket) {
    console.log(`Client diconnected: ${client.id}`);
  
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: string): Promise<string>{
    console.log(`Message from client ${data}`);
    return `Server reseived ${data}`
  }
}
