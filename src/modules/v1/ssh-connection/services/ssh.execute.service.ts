import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';
import { Product } from '../../product/entities/product.interface';
import { ServerInterface } from '../entities/server.interface';
import { ConnectConfigInterface } from '../entities/connect.config.interface';

@Injectable()
export class SshExecuteService {
    public connectConfig2: ConnectConfigInterface = {
        host: '',
        port: 22,
        username: '',
        password: '',
        privateKey: '',
    };

    async loadServerConfig(productId: string) {
        const product: Product = await db('products').where({ id: productId }).first();
        if (!product) throw new NotFoundException('This product is not found');

        const server: ServerInterface = await db('servers')
            .where({ id: product.server_id })
            .first();

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
    async executeInServer(command: string): Promise<object> {
        const conn = new ssh.Client();
        console.log(this.connectConfig2, 2121212);

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
}
