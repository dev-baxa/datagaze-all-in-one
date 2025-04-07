import * as ssh from 'ssh2';

import { ConnectDto } from '../dto/connect.and.upload.dto';
import { IConnectConfig } from '../entity/connect.config.interface';

export function configureSshConnection(data: ConnectDto): IConnectConfig {
    const config: IConnectConfig = {
        host: data.ip,
        port: data.port || 22,
        username: data.username,
    };

    if (data.auth_type === 'password' && data.password) config.password = data.password;
    else if (data.auth_type === 'private_key' && data.private_key)
        config.privateKey = data.private_key;
    else throw new Error('Invalid authentication method');

    return config;
}

export async function connectToServer(conn: ssh.Client, sshConfig: IConnectConfig): Promise<void> {
    return new Promise((resolve, reject) => {
        conn.on('ready', () => resolve());
        conn.on('error', err => reject(err));
        conn.connect({
            ...sshConfig,
        });
    });
}

export async function getSftp(conn: ssh.Client): Promise<ssh.SFTPWrapper> {
    return new Promise((resolve, reject) => {
        conn.sftp((err, sftp) => {
            if (err) return reject(err);
            resolve(sftp);
        });
    });
}
