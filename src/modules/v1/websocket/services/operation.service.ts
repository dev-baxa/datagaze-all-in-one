import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';

import { IProduct } from '../../product/entities/product.interface';
import { IScriptSession, OperationType, ScriptPromptType } from '../entity/operation.types';

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

            const scriptsField = this.getScriptsForOperation(operationType, product);

            if (!scriptsField) throw new Error(`${operationType} uchun skriptlar mavjud emas`);

            const sshConnection = new ssh.Client();
            sshConnection.on('ready', () => {
                sshConnection.shell({ term: 'xterm' }, (err, stream) => {
                    if (err) {
                        client.emit(`${operationType}_error`, err.message);
                        return;
                    }
                    client.emit(`${operationType}_started`, 'Skriptingiz boshlanmoqda...');
                    const session: IScriptSession = {
                        ssh: { client: sshConnection, shell: stream },
                        scripts: this.parseScripts(scriptsField),
                        currentScriptIndex: 0,
                        currentScript: '',
                        operationType,
                        history: { commands: [], outputs: [] },
                    };

                    this.sessions.set(client.id, session);
                    this.executeNextScript(client, session);

                    stream.on('data', data => {
                        this.processShellOutput(client, session, data.toString());
                    });
                });
            });
            sshConnection.on('error', err => {
                client.emit(`${operationType}_error`, `SSH ulanish xatosi: ${err.message}`);
            });

            sshConnection.connect({
                host: product.ip_address,
                port: product.port,
                username: product.username,
                password: payload.password,
            });
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

        setTimeout(() => this.executeNextScript(client, session), 500);
    }

    private getScriptsForOperation(operationType: OperationType, product: IProduct): string {
        switch (operationType) {
            case OperationType.INSTALL:
                return product.install_scripts;
            case OperationType.UPDATE:
                return product.update_scripts;
            case OperationType.DELETE:
                return product.delete_scripts;
            default:
                throw new Error('Noto‘g‘ri operatsiya turi');
        }
    }

    private parseScripts(scriptsText: string): string[] {
        return scriptsText
            .split('\n')
            .map(script => script.trim())
            .filter(script => script && !script.startsWith('#'));
    }

    private executeNextScript(client: Socket, session: IScriptSession): void {
        if (session.currentScriptIndex >= session.scripts.length) {
            client.emit(
                `${session.operationType}_complete`,
                `Barcha skriptlar muvaffaqiyatli bajarildi`,
            );
            this.terminateSession(client);
            return;
        }

        const script = session.scripts[session.currentScriptIndex];
        session.currentScript = script;
        session.history.commands.push(script);

        session.ssh.shell.write(script + '\n');
        session.currentScriptIndex++;
    }

    private processShellOutput(client: Socket, session: IScriptSession, output: string): void {
        client.emit('script_output', output);

        if (/\[sudo\] password for|Password:/.test(output)) {
            this.promptUser(client, session, ScriptPromptType.PASSWORD, 'Sudo parolini kiriting');
        } else if (/\(Y\/n\)|\[yes\/no\]/.test(output)) {
            this.promptUser(
                client,
                session,
                ScriptPromptType.CONFIRMATION,
                'Tasdiqlaysizmi? (Y/n)',
            );
        } else if (/\?|\[.*\]|Enter/.test(output)) {
            this.promptUser(client, session, ScriptPromptType.INPUT, 'Qiymat kiriting');
        }
    }

    private promptUser(
        client: Socket,
        session: IScriptSession,
        type: ScriptPromptType,
        message: string,
    ): void {
        session.awaitingPrompt = { type, message, pattern: /:/ };
        client.emit('script_prompt', { type, message });
    }

    terminateSession(client: Socket): void {
        const session = this.sessions.get(client.id);
        if (session) {
            session.ssh.client.end();
            this.sessions.delete(client.id);
        }
    }
}
