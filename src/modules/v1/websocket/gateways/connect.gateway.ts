import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketExceptionFilter } from 'src/common/filters/websocket.exception.filter';
import { JwtWsAuthGuard } from 'src/common/guards/jwt.ws.auth.guard';

import { Payload } from '../../auth/entities/token.interface';
import { connectDto } from '../dto/connect.and.upload.dto';
import { SshProductInstallService } from '../services/connect.and.file.upload.service';

@WebSocketGateway({ cors: true, namespace: 'connect-and-upload' })
export class SshProductInstallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger = new Logger(SshProductInstallGateway.name);
    @WebSocketServer()
    server: Server;

    constructor(private readonly sshProductInstallService: SshProductInstallService) {}

    handleConnection(client: Socket):void {
        this.logger.log(`CLIENT CONNECTED: ${client.id}`);
    }

    handleDisconnect(client: Socket):void {
        this.logger.log(`CLIENT DISCONNECTED: ${client.id}`);
    }

    @UseGuards(JwtWsAuthGuard)
    @SubscribeMessage('connectToServer')
    @UseFilters(new WebsocketExceptionFilter())
    async connect(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: connectDto & { user: Payload },
    ) :Promise<void> {
        const user = payload.user;
        const progressCallback = (progress: string, percentage: number):void => {
            client.emit('progress', { progressBar: progress, percentage });
        };

        const result = await this.sshProductInstallService.installProduct(
            payload,
            user,
            progressCallback,
        );
        client.emit('response', result);
    }
}
