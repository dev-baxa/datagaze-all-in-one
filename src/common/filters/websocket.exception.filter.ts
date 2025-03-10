import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch(WsException)
export class WebsocketExceptionFilter implements ExceptionFilter{
  private readonly logger = new Logger(WebsocketExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>()

    this.logger.error(`Error in WebSocket Exception: ${exception.message}`);
    client.emit('error', JSON.stringify({ message: exception.message }));
  }
}