import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket , Server } from "socket.io";

@WebSocketGateway({ cors: true })
export class FileTransferGateway{
  @WebSocketServer()
  server: Server;

  sendProgress(clientId: string, progress: number) {
    this.server.to(clientId).emit('progress' , progress)
  }

  @SubscribeMessage('joinProgress')
  handleJoin(client: Socket, payload: { clientId: string }) {
    client.join(payload.clientId)
  }
}