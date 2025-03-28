import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';
import { User } from '../../auth/entities/user.interface';
import { ServerInterface } from '../entities/server.interface';
import { ConnectionDTO } from '../dto/ssh.connection.dto';
import { ConnectConfigInterface } from '../entities/connect.config.interface';

@Injectable()
export class SshConnectToServer {
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
                reject(
                    new BadRequestException({
                        status: 'error1111111',
                        message: 'Invalid authentication method',
                    }),
                );
                return;
            }

            //Log yozish
            const [Log] = await db('ssh_logs')
                .insert({
                    server_id: null,
                    status: 'pending',
                    error_msg: null,
                    user_id: user.id,
                    // created_at : new Date()
                })
                .returning('id');

            conn.on('ready', async () => {
                console.log(`SSH connection established to ${data.ip}`);
                const server: ServerInterface = await db('servers').insert({
                    name: 'string',
                    ip_address: data.ip,
                    port: data.port,
                    password: data.password,
                    private_key: data.private_key,
                    username: data.username,
                });

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
            }).on('error', async err => {
                let errorMessage = 'Unknown error occurred while connecting to the server.';

                if (err.message.includes('Cannot parse privateKey')) {
                    errorMessage = 'Invalid private key format. Please check your key file.';
                } else if (err.message.includes('All configured authentication methods failed')) {
                    errorMessage =
                        'Authentication failed. Please check your username and password/private key.';
                } else if (err.message.includes('ECONNREFUSED')) {
                    errorMessage = 'Connection refused. Server might be unreachable.';
                }

                await db('ssh_logs')
                    .where({ id: Log.id })
                    .update({ status: 'failed', error_msg: errorMessage });

                reject(new BadRequestException({ message: errorMessage }));
            });
            try {
                conn.connect(connectionConfig);
            } catch (error) {
                reject(
                    new HttpException(
                        {
                            status: 'error',
                            message: 'Invalid SSH connection parameters.',
                        },
                        HttpStatus.BAD_REQUEST,
                    ),
                );
            }
        });
    }
}
