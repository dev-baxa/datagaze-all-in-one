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
import db from 'src/config/database.config';
import * as ssh from 'ssh2';
import { Product } from '../../product/entities/product.interface';
import { ServerInterface } from '../../server/entities/server.interface';
import { ExecuteDto } from '../dto/exescute.connection.dto';
import { ConnectConfigInterface } from '../entities/connect.config.interface';

@WebSocketGateway({ cors: true })
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor() {
        console.log('SshGateway initialized');
    }

    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        client.emit('message', 'WebSocket connection established');
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client diconnected: ${client.id}`);
    }

    @SubscribeMessage('executeCommand')
    async executeCommand(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { event: string; body: ExecuteDto },
    ) {
        const productId = payload.body.productId;
        const command = payload.body.command;

      console.log(client.id)

        const product: Product = await db('products').where({ id: productId }).first();
        const server: ServerInterface = await db('servers')
            .where({ id: product.server_id })
            .first();
        const connectConfig: ConnectConfigInterface = {
            host: server.ip_address,
            port: server.port,
            username: server.username,
            password: server.password ? server.password : '',
            privateKey: server.private_key ? server.private_key : '',
        };
        client.emit('commandStarted', 'Command execution started');
        const conn = new ssh.Client();

        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) {
                    console.log(err , 111);
                    conn.end();
                    client.emit('commandError', err.message);
                }

              stream.on('data', chunk => {
                    client.emit('commandOutput', chunk.toString());
                });

                stream.stderr.on('data', chunk => {
                    client.emit('commandError', chunk.toString());
                });

                stream.on('close', () => {
                    console.log(err ,11);

                    conn.end();
                    client.emit('commandCompleted', 'Command execution finished');
                });
            });
        });
        conn.on('error', err => {
            console.log(err , 121);

            client.emit('CommandError', err.message);
        });

        conn.connect(connectConfig);
    }
}
