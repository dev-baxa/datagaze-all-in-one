import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';
import { User } from '../../auth/entities/user.interface';
import { Product } from '../../product/entities/product.interface';
import { ServerInterface } from '../../server/entities/server.interface';
import { installDto } from '../dto/product.install.dto';
import { ConnectConfigInterface } from '../entities/connect.config.interface';

@Injectable()
export class SshProductInstallService {
    public sshConfig: ConnectConfigInterface = {
        host: '',
        port: 22,
        username: '',
        password: '',
        privateKey: '',
    };
    async installProduct(data: installDto, user: User): Promise<object> {
        return new Promise(async (resolve, reject) => {
            // const execAsync = promisify(exec)
            const product: Product = await db('products').where({ id: data.productId }).first();

            if (product.path === null || !product.path)
                reject(new NotFoundException('Product path not found'));

            const productPath = product.path[`${data.os_type}.v-${data.version}`];

            console.log(productPath, 121212);

            if (!productPath)
                reject(
                    new NotFoundException(
                        'The product that matches the os type and version you selected is not yet installed. Please first install the product.',
                    ),
                );

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
                        message: 'Invalid authentication method',
                    }),
                );
                return;
            }

            this.sshConfig = connectionConfig;

            const [Log] = await db('ssh_logs')
                .insert({
                    server_id: null,
                    status: 'pending',
                    error_msg: null,
                    user_id: user.id,
                })
                .returning('*'); // **Logni obyekt shaklida olish**

            conn.on('ready', async () => {
                console.log(`SSH connection established to ${data.ip}`);

                conn.sftp((err, sftp) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return reject(err);
                    }
                    console.log("FAylni ko'chirish boshlandi !!!!");
                    const remoteFilePath = path.basename(
                        product.path[`${data.os_type}.v-${data.version}`],
                    );
                    const localFilePath = product.path[`${data.os_type}.v-${data.version}`];
                    console.log(localFilePath, 'local');
                    console.log(remoteFilePath, 'remote');

                    sftp.fastPut(localFilePath, remoteFilePath, async err => {
                        if (err) {
                            conn.end();
                            console.log(err);

                            console.log(err.message);
                            return reject(
                                new InternalServerErrorException(
                                    `Faylni ko'chirishda xatolik : ${err.message}`,
                                ),
                            );
                        }
                        console.log("Fayl muvaffaqiiyatli ko'chirildi !");

                        const server: ServerInterface = (
                            await db('servers')
                                .insert({
                                    name: 'string',
                                    ip_address: data.ip,
                                    port: data.port,
                                    password: data.password,
                                    private_key: data.private_key,
                                    username: data.username,
                                    os_type: 'linux',
                                })
                                .returning('*')
                        )[0];

                        await db('ssh_logs')
                            .where({ id: Log.id })
                            .update({ status: 'succes', server_id: server.id });

                        await db('installed_products').insert({
                            product_id: product.id,
                            server_id: server.id,
                            version: data.version,
                            status: 'installed',
                        });

                        await db('products')
                            .update({ server_id: server.id, is_installed: true })
                            .where({ id: product.id });

                        console.log("Ilova o'rnatildi !");
                        conn.end();
                        resolve({
                            status: 'succes',
                            session_id: Log.id,
                            message: 'Product installed successfully.',
                            server_id: server.id,
                        });
                    });
                });
            });
            conn.on('error', async err => {
                console.log(err);

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
