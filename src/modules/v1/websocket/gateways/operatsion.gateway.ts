import { Logger, UseFilters } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketExceptionFilter } from 'src/common/filters/websocket.exception.filter';
import { OperationsService } from '../services/operation.service';
import { OperationType } from '../entity/operation.types';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'operation',
})
@UseFilters(new WebsocketExceptionFilter())
export class OperationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger = new Logger(OperationsGateway.name);
    @WebSocketServer() server: Server;

    constructor(private readonly operationsService: OperationsService) {}

    @SubscribeMessage('start_product_install')
    async startProductInstallation(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { productId: string; password: string },
    ) {
        console.log(payload, 'payload');

        await this.operationsService.startOperation(client, payload, OperationType.INSTALL);
    }

    @SubscribeMessage('start_product_update')
    async startProductUpdate(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { productId: string; password: string },
    ) {
        await this.operationsService.startOperation(client, payload, OperationType.UPDATE);
    }

    @SubscribeMessage('start_product_delete')
    async startProductDelete(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { productId: string; password: string },
    ) {
        await this.operationsService.startOperation(client, payload, OperationType.DELETE);
    }

    @SubscribeMessage('script_interaction_response')
    handleScriptInteraction(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { response: string },
    ) {
        this.operationsService.handleScriptInteraction(client, payload);
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.operationsService.terminateSession(client);
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
