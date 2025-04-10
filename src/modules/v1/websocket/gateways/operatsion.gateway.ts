import { Logger, UseFilters } from '@nestjs/common';
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

import { OperationType } from '../entity/operation.types';
import { OperationsService } from '../services/operation.service';

@WebSocketGateway({
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
    ): Promise<void> {
        await this.operationsService.startOperation(client, payload, OperationType.INSTALL);
    }

    @SubscribeMessage('start_product_update')
    async startProductUpdate(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { productId: string; password: string },
    ): Promise<void> {
        await this.operationsService.startOperation(client, payload, OperationType.UPDATE);
    }

    @SubscribeMessage('start_product_delete')
    async startProductDelete(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { productId: string; password: string },
    ): Promise<void> {
        await this.operationsService.startOperation(client, payload, OperationType.DELETE);
    }

    @SubscribeMessage('script_interaction_response')
    handleScriptInteraction(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { response: string },
    ): void {
        this.operationsService.handleScriptInteraction(client, payload);
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket): void {
        this.operationsService.terminateSession(client);
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
