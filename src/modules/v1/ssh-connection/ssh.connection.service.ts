import { BadRequestException, Injectable } from '@nestjs/common';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';

import { IUser } from '../auth/entities/user.interface';
import { ConnectionDTO } from './dto/ssh.connection.dto';
import { IConnectConfig } from './entities/connect.config.interface';

@Injectable()
export class SshConnectService {
    async connectToServerCheck(data: ConnectionDTO, user: IUser): Promise<object> {

        const product = await db('products').where({ id: data.product_id }).first();
        if (!product) throw new BadRequestException('Product not found');

        const conn = new ssh.Client();

        const connectionConfig: IConnectConfig = {
            host: data.ip,
            port: data.port,
            username: data.username,
        };

        if (data.auth_type === 'password' && data.password) {
            connectionConfig.password = data.password;
        } else if (data.auth_type === 'private_key' && data.private_key) {
            connectionConfig.privateKey = data.private_key;
        } else {
            throw new BadRequestException('Invalid authentication method');
        }

        const connectPromise = new Promise<void>((resolve, reject) => {
            conn.on('ready', () => {
                resolve();
            });

            conn.on('error', err => {
                reject(err);
            });

            conn.connect(connectionConfig);
        });

        try {
            await connectPromise;
            const [server] = await db('servers')
                .insert({
                    ip_address: data.ip,
                    port: data.port,
                    username: data.username,
                })
                .returning('id');

            const [log] = await db('ssh_logs')
                .insert({
                    server_id: server.id,
                    status: 'success',
                    error_msg: null,
                    user_id: user.id,
                })
                .returning('id');

            conn.end();

            await db('products').where({ id: data.product_id }).update({
                server_id: server.id,
                is_installed: true,
            });

            return {
                status: 'success',
                message: 'Connected successfully.',
                session_id: log.id,
                server_id: server.id,
            };
            
        } catch (err) {
            const [log] = await db('ssh_logs')
                .insert({
                    server_id: null,
                    status: 'failed',
                    error_msg: err.message,
                    user_id: user.id,
                })
                .returning('id');

            throw new BadRequestException({
                message: err.message,
                session_id: log.id,
            });
        }
    }
}
