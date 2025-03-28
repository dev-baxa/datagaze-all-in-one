import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ConnectToServerDto } from "../dto/connect-to-server.dto";
import { ConnectionDTO } from "../dto/connect.dto";


@WebSocketGateway({ namespace: 'connect', cors: true })
export class ConnectGateway implements OnGatewayConnection , OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket, ...args: Socket[]) {
    console.log(`Client connected: ${client.id}`);
    client.emit('message', 'WebSocket connection established');
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('connect')
  async connect(client: Socket, payload: ConnectionDTO) {
    
  }
}