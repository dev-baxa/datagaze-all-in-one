import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';

import { ConnectToServerDto } from '../dto/connect-to-server.dto';
import { ConnectConfigInterface } from '../entity/connect.config.interface';
import { ServerInterface } from '../entity/server.interface';

@Injectable()
export class TerminalService {
    private sshSessions: Map<string, { client: ssh.Client; shell: ssh.Channel }> = new Map();

    async connectToServer(client: Socket, payload: ConnectToServerDto): Promise<void> {
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
            password: payload.password ? payload.password : '',
            // privateKey: server.private_key ? server.private_key : '',
        };

        const conn = new ssh.Client();

        conn.on('ready', () => {
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

    handleTerminalData(client: Socket, data: string): void {
        const session = this.sshSessions.get(client.id);
        if (!session) {
            client.emit('ssh_error', 'Not connected to SSH server');
            return;
        }

        session.shell.write(data);
    }

    disconnectClient(clientId: string): void {
        const session = this.sshSessions.get(clientId);
        if (session) {
            session.shell.end();
            session.client.end();
            this.sshSessions.delete(clientId);
        }
    }
}
