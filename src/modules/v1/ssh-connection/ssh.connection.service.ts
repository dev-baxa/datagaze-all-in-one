import { BadRequestException, Injectable } from '@nestjs/common';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';
import { User } from '../auth/entities/user.interface';
import { ConnectionDTO } from './dto/ssh.connection.dto';
import { ConnectConfigInterface } from './entities/connect.config.interface';

@Injectable()
export class SshConnectService {
    async connectToServerCheck(data: ConnectionDTO, user: User): Promise<object> {
        return new Promise(async (resolve, reject) => {
            const conn = new ssh.Client();
            const connectionConfig: ConnectConfigInterface = {
                host: data.ip,
                port: data.port,
                username: data.username,
            };

            if (data.auth_type === 'password' && data.password) {
                connectionConfig.password = data.password;
            } else if (data.auth_type === 'private_key' && data.private_key) {
                connectionConfig.privateKey = data.private_key;
            } else {
                reject(new BadRequestException('Invalid authentication method'));
                return;
            }

            //Log yozish
            const [Log] = await db('ssh_logs')
                .insert({
                    server_id: null,
                    status: 'pending',
                    error_msg: null,
                    user_id: user.id,
                })
                .returning('id');

            conn.on('ready', async () => {
                const [server] = await db('servers')
                    .insert({
                        ip_address: data.ip,
                        port: data.port,
                        username: data.username,
                    })
                    .returning('id');

                await db('ssh_logs')
                    .where({ id: Log.id })
                    .update({ status: 'succes', server_id: server.id });
                conn.end();

                resolve({
                    status: 'succes',
                    message: 'Connected successfully.',
                    session_id: Log.id,
                    server_id: server.id,
                });
            });
            conn.on('error', async err => {
                await db('ssh_logs')
                    .where({ id: Log.id })
                    .update({ status: 'failed', error_msg: err.message });

                reject(new BadRequestException({ message: err.message }));
            });
            conn.connect(connectionConfig);
        });
    }
}
