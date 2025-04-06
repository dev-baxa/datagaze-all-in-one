import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';
import db from 'src/config/database.config';
import { Channel, Client } from 'ssh2';

import { Product } from '../product/entities/product.interface';
import { ConnectConfigInterface } from '../ssh-connection/entities/connect.config.interface';
import { ServerInterface } from '../ssh-connection/entities/server.interface';

@Injectable()
export class SshService {
    private readonly logger = new Logger(SshService.name);
    private product: Product;
    private sshSessions: Map<string, { client: Client; shell: Channel }> = new Map();

    handleConnection(socket: Socket): void {
        socket.emit('message', 'WebSocket connection established');
    }

    handleDisconnect(socket: Socket): void {
        this.logger.log(`Client disconnected: ${socket.id}`);
        const session = this.sshSessions.get(socket.id);
        if (session) {
            session.shell.end();
            session.client.end();
            this.sshSessions.delete(socket.id);
        }
    }

    async connectSSH(socket: Socket, productId: string): Promise<void> {
        const product: Product = await db('products').where({ id: productId }).first();
        if (!product) throw new NotFoundException('This product is not found');

        this.product = product;

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

        const conn = new Client();

        conn.on('ready', () => {
            conn.shell((err, stream) => {
                if (err) {
                    socket.emit('ssh_error', 'Shell mode error:' + err.message);
                    return;
                }

                this.sshSessions.set(socket.id, {
                    client: conn,
                    shell: stream,
                });

                stream.on('data', data => {
                    socket.emit('ssh_output', data.toString());
                });

                stream.stderr.on('data', data => {
                    socket.emit('ssh_error', data.toString());
                });

                socket.emit('ssh_status', 'connected');
            });
        });

        conn.on('error', err => {
            socket.emit('ssh_error', err.message);
        });

        conn.connect(connectConfig);
    }

    async runCommand(socket: Socket, input: string): Promise<void> {
        const session = this.sshSessions.get(socket.id);
        if (!session) {
            socket.emit('ssh_error', 'Not connected to SSH server');
            return;
        }

        session.shell.write(input);
    }

    async getInstallScript(id: string): Promise<string> {
        const product: Product = await db('products').where({ id: id }).first();
        return product.install_scripts;
    }
}
