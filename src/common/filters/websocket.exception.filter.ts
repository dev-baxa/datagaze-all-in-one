// WebsocketExceptionFilter.ts
import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WebsocketExceptionFilter extends BaseWsExceptionFilter {
    private readonly logger = new Logger(WebsocketExceptionFilter.name);

    catch(exception: WsException, host: ArgumentsHost) :void{
        this.logger.error(`Exception caught: ${exception.message}`);

        const client = host.switchToWs().getClient<Socket>();
        const error = exception.getError();
        const details = typeof error === 'string' ? { message: error } : error;

        client.emit('exception', { status: 'error', ...details });
    }
}
