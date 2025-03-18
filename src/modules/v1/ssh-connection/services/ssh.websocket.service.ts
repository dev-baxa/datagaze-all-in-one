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
import { ConnectToServerDto } from '../dto/connect.to.server.dto';
import { ConnectConfigInterface } from '../entities/connect.config.interface';

@WebSocketGateway({ cors: true })
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private sshSessions: Map<string, { client: ssh.Client; shell: ssh.Channel }> = new Map();
    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        client.emit('message', 'WebSocket connection established');
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client diconnected: ${client.id}`);
        const session = this.sshSessions.get(client.id);
        if (session) {
            session.shell.end();
            session.client.end();

            this.sshSessions.delete(client.id);
        }
    }
    @SubscribeMessage('connectToServer')
    async connectToServer(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: ConnectToServerDto,
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
            console.log("SSH ulanish muvaffaqiyatli o'rnatildi");
            conn.shell((err, stream) => {
                if (err) {
                    client.emit('ssh_error', 'Shell mode error:' + err.message);
                    return;
                }

                this.sshSessions.set(client.id, { client: conn, shell: stream });

                stream.on('data', data => {
                    client.emit('ssh_output', data.toString());
                });

                stream.stderr.on('data', data => {
                    client.emit('ssh_error', data.toString());
                });

                client.emit('ssh_status', 'connected');
            });
        });
        conn.on('error', err => {
            client.emit('ssh_error', err.message);
        });
        conn.connect(connectConfig);
    }
    @SubscribeMessage('runCommand')
    async handleRunCommand(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { command: string },
    ) {
        const session = this.sshSessions.get(client.id);
        if (!session) {
            client.emit('ssh_error', 'Not connected to SSH server');
            return;
        }

        session.shell.write(payload.command + '\n');
    }
}
