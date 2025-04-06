import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';

import { Payload } from '../../auth/entities/token.interface';
import { Product } from '../../product/entities/product.interface';
import { connectDto } from '../dto/connect.and.upload.dto';
import { ConnectConfigInterface } from '../entity/connect.config.interface';
import { ServerInterface } from '../entity/server.interface';

@Injectable()
export class SshProductInstallService {
    public sshConfig: ConnectConfigInterface = {
        host: '',
        port: 22,
        username: '',
        password: '',
        privateKey: '',
    };

    async installProduct(
        data: connectDto,
        user: Payload,
        progressCallback?: (progress: string, percentage: number) => void,
    ): Promise<object> {
        const product = await db('products').where({ id: data.productId }).first();
        if (!product?.server_path) {
            throw new WsException('Product path not found');
        }

        const sshConfig = this.configureSshConnection(data);
        const [log] = await db('ssh_logs')
            .insert({ status: 'pending', user_id: user.id })
            .returning('*');

        const conn = new ssh.Client();
        return new Promise((resolve, reject) => {
            conn.on('ready', async () => {
                conn.sftp(async (err, sftp) => {
                    if (err) {
                        conn.end();
                        return reject(err);
                    }

                    await this.uploadFile(
                        sftp,
                        product.server_path,
                        path.basename(product.server_path),
                        progressCallback,
                    );

                    const server = await this.saveInstallationData(
                        product,
                        {
                            ip_address: data.ip,
                            port: data.port || 22,
                            username: data.username,
                        },
                        log.id,
                    );

                    conn.end();
                    resolve({
                        status: 'success',
                        session_id: log.id,
                        message: 'Product installed successfully.',
                        server_id: server.id,
                    });
                });
            });

            conn.on('error', async err => {
                const errorMessage = this.handleSshError(err);
                await db('ssh_logs')
                    .where({ id: log.id })
                    .update({ status: 'failed', error_msg: errorMessage });
                reject(new WsException({ message: errorMessage }));
            });

            conn.connect(sshConfig);
        });
    }

    private handleSshError(err: Error): string {
        if (err.message.includes('Cannot parse privateKey')) {
            return 'Invalid private key format. Please check your key file.';
        } else if (err.message.includes('All configured authentication methods failed')) {
            return 'Authentication failed. Please check your username and password/private key.';
        } else if (err.message.includes('ECONNREFUSED')) {
            return 'Connection refused. Server might be unreachable.';
        }
        return 'Unknown error occurred while connecting to the server.';
    }

    private async saveInstallationData(
        product: Product,
        serverData: Partial<ServerInterface>,
        logId: string,
    ): Promise<ServerInterface> {
        const [server] = await db('servers').insert(serverData).returning('*');

        await db('ssh_logs')
            .where({ id: logId })
            .update({ status: 'success', server_id: server.id });
        await db('installed_products').insert({
            product_id: product.id,
            server_id: server.id,
            version: product.server_version,
            status: 'installed',
        });
        await db('products')
            .update({ server_id: server.id, is_installed: true })
            .where({ id: product.id });

        return server;
    }

    private async uploadFile(
        sftp: ssh.SFTPWrapper,
        localFilePath: string,
        remoteFilePath: string,
        progressCallback?: (progress: string, percentage: number) => void,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const stats = fs.statSync(localFilePath);
            const fileSize = stats.size;
            const barLength = 20;
            let transferred = 0;

            const stream = sftp.createWriteStream(remoteFilePath);
            const readStream = fs.createReadStream(localFilePath);

            readStream.on('data', chunk => {
                transferred += chunk.length;
                const progress = Math.floor((transferred / fileSize) * barLength);
                const percentage = ((transferred / fileSize) * 100).toFixed(2);
                const progressBar = `[${'#'.repeat(progress)}${' '.repeat(barLength - progress)}]`;

                if (progressCallback) {
                    progressCallback(progressBar, parseFloat(percentage));
                }
            });

            readStream.on('end', () => resolve());
            readStream.on('error', err =>
                reject(new WsException(`Faylni ko'chirishda xatolik: ${err.message}`)),
            );
            readStream.pipe(stream);
        });
    }

    private configureSshConnection(data: connectDto): ConnectConfigInterface {
        const config: ConnectConfigInterface = {
            host: data.ip,
            port: data.port || 22,
            username: data.username,
        };

        if (data.auth_type === 'password' && data.password) {
            config.password = data.password;
        } else if (data.auth_type === 'private_key' && data.private_key) {
            config.privateKey = data.private_key;
        } else {
            throw new WsException('Invalid authentication method');
        }

        return config;
    }
}
