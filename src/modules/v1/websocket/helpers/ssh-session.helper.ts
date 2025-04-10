import { Socket } from 'socket.io';
import * as ssh from 'ssh2';

import { IProduct } from '../../product/entities/product.interface';
import { IScriptSession, OperationType } from '../entity/operation.types';
import { IServer } from '../entity/server.interface';
import { executeNextScript, processShellOutput } from './script-exucation.helper';
import { parseScripts } from './script-parser.helper';

export async function connectViaSsh(
    product: IServer & IProduct,
    password: string,
): Promise<ssh.Client> {
    return new Promise((resolve, reject) => {
        const conn = new ssh.Client();
        conn.on('ready', () => resolve(conn))
            .on('error', err => reject(new Error(`SSH ulanish xatosi: ${err.message}`)))
            .connect({
                host: product.ip_address,
                port: product.port,
                username: product.username,
                password: password,
            });
    });
}

export function initializeShellSession(
    sshConnection: ssh.Client,
    client: Socket,
    scriptsText: string,
    operationType: OperationType,
    sessions: Map<string, IScriptSession>,
): void {
    sshConnection.shell({ term: 'xterm' }, (err, stream) => {
        if (err) {
            client.emit(`${operationType}_error`, err.message);
            return;
        }

        client.emit(`${operationType}_started`, 'Skriptingiz boshlanmoqda...');
        const session: IScriptSession = {
            ssh: { client: sshConnection, shell: stream },
            scripts: parseScripts(scriptsText),
            currentScriptIndex: 0,
            currentScript: '',
            operationType,
            history: { commands: [], outputs: [] },
        };

        sessions.set(client.id, session);
        executeNextScript(client, session);

        stream.on('data', data => processShellOutput(client, session, data.toString()));
    });
}

export function terminateSshSession(session: IScriptSession): void {
    session.ssh.client.end();
}
