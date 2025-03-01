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
import { User } from '../auth/entities/user.interface';
import { Product } from '../product/entities/product.interface';
import { Server } from '../server/entities/server.interface';
import { installDto } from './dto/product.install.dto';
import { ConnectionDTO } from './dto/ssh.connection.dto';
import { ConnectConfigInterface } from './entities/connect.config.interface';

@Injectable()
export class SshConnectService {
    private connectConfig2: ConnectConfigInterface;
    constructor() {
        this.connectConfig2 = {
            host: '',
            port: 22,
            username: '',
            privateKey: '', // ixtiyoriy
            password: '', // ixtiyoriy
        };
    }

    public async loadServerConfig(productId: string) {
        const product: Product = await db('products').where({ id: productId }).first();
        if (!product) throw new NotFoundException('This product is not found');

        const server: Server = await db('servers').where({ id: product.server_id }).first();

        if (!server) throw new NotFoundException('This server is not found');

        this.connectConfig2.host = server.ip_address;
        this.connectConfig2.port = server.port;
        this.connectConfig2.username = server.username;

        if (server.password) {
            this.connectConfig2.password = server.password;
        } else if (server.private_key) {
            this.connectConfig2.privateKey = server.private_key;
        }
    }

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
                const server: Server = await db('servers').insert({
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
    async connectToServer2(data: ConnectionDTO, user: User): Promise<object> {
        const conn = new ssh.Client();
        const connectionConfig = this.connectConfig2;

        if (data.auth_type === 'password' && data.password) {
            connectionConfig.password = data.password;
        } else if (data.auth_type === 'private_key' && data.private_key) {
            connectionConfig.privateKey = data.private_key;
        } else {
            throw new BadRequestException({
                status: 'error',
                message: 'Invalid authentication method',
            });
        }

        // **Log yozish (pending holatda)**
        const Log = (
            await db('ssh_logs')
                .insert({
                    server_id: null,
                    status: 'pending',
                    error_msg: null,
                    user_id: user.id,
                })
                .returning('*')
        )[0]; // **Logni obyekt shaklida olish**

        return new Promise((resolve, reject) => {
            conn.on('ready', async () => {
                console.log(`SSH connection established to ${data.ip}`);

                try {
                    const server: Server = await db('servers').insert({
                        name: 'string',
                        ip_address: data.ip,
                        port: data.port,
                        password: data.password,
                        private_key: data.private_key,
                        username: data.username,
                    });

                    // **Logni yangilash (success holati)**
                    await db('ssh_logs')
                        .where({ id: Log.id })
                        .update({ status: 'success', server_id: server.id });

                    conn.end();
                    resolve({
                        status: 'success',
                        message: 'Connected successfully.',
                        session_id: Log.id,
                        server_id: server.id,
                    });
                } catch (error) {
                    await db('ssh_logs')
                        .where({ id: Log.id })
                        .update({ status: 'failed', error_msg: 'Error saving server data.' });

                    reject(
                        new HttpException(
                            { status: 'error', message: 'Error saving server data.' },
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        ),
                    );
                }
            });

            conn.on('error', async err => {
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
                console.log(1);

                conn.connect(connectionConfig);
                console.log(2);
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

    async executeInServer(command: string): Promise<object> {
        const conn = new ssh.Client();
        console.log(this.connectConfig2);

        return new Promise((resolve, reject) => {
            conn.on('ready', () => {
                conn.exec(command, (err, stream) => {
                    if (err) {
                        conn.end();
                        console.log(err);

                        return reject(err);
                    }

                    let outPut = '';
                    let errorOutPut = '';

                    stream.on('data', data => {
                        outPut += data.toString();
                    });

                    stream.stderr.on('data', data => {
                        errorOutPut += data.toString();
                    });

                    stream.on('close', code => {
                        conn.end();
                        if (code !== 0) {
                            console.log(errorOutPut, 'Bu erroning logi');
                            reject(new BadRequestException(`Command failed: ${errorOutPut}`));
                        } else {
                            resolve({
                                status: 'success',
                                result: outPut.trim(),
                            });
                        }
                    });
                });
            });
            conn.on('error', async err => {
                let errorMessage = 'Unknown error occurred while connecting to the server.';

                if (err.message.includes('Cannot parse privateKey')) {
                    errorMessage = 'Invalid private key format. Please check your key file.';
                } else if (err.message.includes('All configured authentication methods failed')) {
                    errorMessage =
                        'Authentication failed. Please check your username and password/private key.';
                } else if (err.message.includes('ECONNREFUSED')) {
                    errorMessage = 'Connection refused. Server might be unreachable.';
                }

                reject(new BadRequestException({ message: errorMessage }));
            });
            conn.connect(this.connectConfig2);
        });
    }
    async installProductInServer(data: installDto, user: User): Promise<object> {
        return new Promise(async (resolve, reject) => {
            // const execAsync = promisify(exec)
            const product: Product = await db('products').where({ id: data.productId }).first();

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
                    const remoteFilePath = path.basename(product.path);
                    const localFilePath = product.path;
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

                        conn.exec(`sudo dpkg -i ${remoteFilePath} `, async (err, stream) => {
                            if (err) {
                                conn.end();
                                console.log(err, 22);

                                return reject(
                                    new InternalServerErrorException(
                                        `Buyruq bajarishda xatolik : ${err.message}`,
                                    ),
                                );
                            }

                            let errorOutPut = '',
                                outPut = '';

                            stream.on('data', data => {
                                outPut += data.toString();
                            });

                            stream.stderr.on('data', data => {
                                errorOutPut += data.toString();
                            });

                            stream.on('close', async code => {
                                if (code !== 0) {
                                    conn.end();
                                    console.log(err);
                                    return reject(
                                        new InternalServerErrorException(
                                            `Dasturni o'rnatishdagi xatolik ,  chiqish kodi ${code} : ${errorOutPut}  ${outPut}`,
                                        ),
                                    );
                                }
                                const server: Server = (
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
                                    version: product.version,
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
    async installProductInServer2(data: installDto, user: User): Promise<object> {
        return new Promise(async (resolve, reject) => {
            const product: Product = await db('products').where({ id: data.productId }).first();

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

            const logId = (
                await db('ssh_logs')
                    .insert({
                        server_id: null,
                        status: 'pending',
                        error_msg: null,
                        user_id: user.id,
                    })
                    .returning('id')
            )[0].id; // **Logni obyekt shaklida olish**

            conn.on('ready', async () => {
                console.log(`SSH connection established to ${data.ip}`);

                conn.sftp((err, sftp) => {
                    if (err) {
                        conn.end();
                        console.log(err);
                        return reject(err);
                    }
                    console.log("FAylni ko'chirish boshlandi !!!!");
                    const remoteFilePath = path.basename(product.path);
                    const localFilePath = product.path;

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
                        conn.end();

                        const serverId = (
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
                                .returning('id')
                        )[0].id;
                        console.log(serverId, ' 11serverId');

                        await db('products')
                            .update({ server_id: serverId })
                            .where({ id: data.productId });

                        await db('ssh_logs')
                            .update({
                                server_id: serverId,
                                status: 'succes',
                            })
                            .where({ id: logId });

                        return resolve({
                            status: 'succes',
                            message:
                                "O'rnatish uchun faylni serverga ko'chirib qo'yildi endi terminaldan kirib o'rnatsa bass",
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
                    .where({ id: logId })
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
    // async transferAndInstallApp()
}
