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
import { ServerInterface } from '../../server/entities/server.interface';
import { ConnectConfigInterface } from '../entities/connect.config.interface';

@WebSocketGateway({ cors: true })
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private sshConnections: Map<string, ssh.Client> = new Map();
    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        client.emit('message', 'WebSocket connection established');
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client diconnected: ${client.id}`);
        const conn = this.sshConnections.get(client.id);
        if (conn) {
            conn.end();
            this.sshConnections.delete(client.id);
        }
    }

    @SubscribeMessage('connectToServer')
    async connectToServer(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { productId: string },
    ) {
        const productId = payload.productId;

        const server: ServerInterface = await db('products')
            .join('servers', 'products.server_id', 'servers.id')
            .where('products.id', productId)
            .select('servers.*')
            .first();

        const connectConfig: ConnectConfigInterface = {
            host: server.ip_address,
            port: server.port,
            username: server.username,
            password: server.password ? server.password : '',
            privateKey: server.private_key ? server.private_key : '',
        };

        const conn = new ssh.Client();

        conn.on('ready', () => {
            console.log('SSH Connection Established');
            this.sshConnections.set(client.id, conn);
            client.emit('sshStatus', 'Connected');
        })
            .on('error', err => {
                console.log(err, 121);
                client.emit('CommandError', err.message);
            })
            .connect(connectConfig);
    }

    @SubscribeMessage('runCommand')
    async handleRunCommand(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { command: string },
    ) {
        const conn = this.sshConnections.get(client.id);

        if (!conn) {
            client.emit('commandError', 'SSH connection not established');
            return;
        }

        conn.exec(payload.command, (err, stream) => {
            if (err) {
                console.log(err, 111);
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
                client.emit('sshStatus', 'Command Done');
            });
        });
    }
}
