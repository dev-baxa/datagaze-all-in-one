import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import db from 'src/config/database.config';
import { Client } from 'ssh2';

import { IPayload } from '../../auth/entities/token.interface';
import { ConnectDto } from '../dto/connect.and.upload.dto';
import { uploadFile } from '../helpers/file-upload.helper';
import { saveInstallationData } from '../helpers/installation-data.helper';
import { configureSshConnection, connectToServer, getSftp } from '../helpers/ssh-connection.helper';
import { handleSshError } from '../helpers/ssh-error.handler';
@Injectable()
export class SshProductInstallService {
    async installProduct(
        data: ConnectDto & { user: IPayload },
        progressCallback?: (progress: string, percentage: number) => void,
    ): Promise<object> {
        const product = await db('products').where({ id: data.productId }).first();
        if (!product?.server_path) throw new WsException('IProduct path not found');

        const sshConfig = configureSshConnection(data);

        const conn = new Client();

        try {
            await connectToServer(conn, sshConfig);
            const sftp = await getSftp(conn);

            await uploadFile(sftp, product.server_path, progressCallback);

            const [log] = await db('ssh_logs')
                .insert({ status: 'pending', user_id: data.user.id })
                .returning('*');

            const server = await saveInstallationData(product, {
                ip_address: data.ip,
                port: data.port || 22,
                username: data.username,
            });

            sftp.end();
            conn.end();

            return {
                status: 'success',
                session_id: log.id,
                message: 'IProduct installed successfully.',
                server_id: server.id,
            };
        } catch (err) {
            const errorMessage = handleSshError(err);
            await db('ssh_logs').insert({ status: 'failed', user_id: data.user.id });
            throw new WsException({ message: errorMessage });
        }
    }
}
