import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import db from 'src/config/database.config';

import { IScriptSession, OperationType } from '../entity/operation.types';
import { executeNextScript } from '../helpers/script-exucation.helper';
import { getScriptsForOperation } from '../helpers/script-parser.helper';
import {
    connectViaSsh,
    initializeShellSession,
    terminateSshSession,
} from '../helpers/ssh-session.helper';

@Injectable()
export class OperationsService {
    private sessions: Map<string, IScriptSession> = new Map();

    async startOperation(
        client: Socket,
        payload: { productId: string; password: string },
        operationType: OperationType,
    ): Promise<void> {
        try {
            const product = await db('products')
                .join('servers', 'products.server_id', 'servers.id')
                .where('products.id', payload.productId)
                .select(
                    'servers.*',
                    'products.install_scripts',
                    'products.update_scripts',
                    'products.delete_scripts',
                )
                .first();

            if (!product) throw new WsException('Mahsulot yoki server topilmadi');

            const scriptsField = getScriptsForOperation(operationType, product);
            if (!scriptsField)
                throw new WsException(`${operationType} uchun skriptlar mavjud emas`);

            const sshConnection = await connectViaSsh(product, payload.password);
            initializeShellSession(
                sshConnection,
                client,
                scriptsField,
                operationType,
                this.sessions,
            );
        } catch (error) {
            client.emit(`${operationType}_error`, error.message);
        }
    }

    handleScriptInteraction(client: Socket, payload: { response: string }): void {
        const session = this.sessions.get(client.id);
        if (!session || !session.awaitingPrompt) {
            client.emit('interaction_error', 'Hozirda javob kutilmayapti');
            return;
        }

        session.ssh.shell.write(payload.response + '\n');
        session.awaitingPrompt = undefined;

        setTimeout(() => executeNextScript(client, session), 500);
    }

    terminateSession(client: Socket): void {
        const session = this.sessions.get(client.id);
        if (session) {
            terminateSshSession(session);
            this.sessions.delete(client.id);
        }
    }
}
