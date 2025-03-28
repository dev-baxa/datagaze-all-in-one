import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import db from 'src/config/database.config';
import * as ssh from 'ssh2';

enum ScriptPromptType {
    PASSWORD = 'password',
    CONFIRMATION = 'confirmation',
    INPUT = 'input',
}

interface ScriptSession {
    ssh: {
        client: ssh.Client;
        shell: ssh.Channel;
    };
    scripts: string[];
    currentScriptIndex: number;
    currentScript: string;
    awaitingPrompt?: {
        type: ScriptPromptType;
        message: string;
        pattern: RegExp;
    };
    history: {
        commands: string[];
        outputs: string[];
    };
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'product-install',
})
export class ProductInstallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private sessions: Map<string, ScriptSession> = new Map();

    @SubscribeMessage('start_product_installation')
    async startProductInstallation(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { productId: string },
    ) {
        try {
            // 1. Mahsulot va uning serverini olish
            const product = await db('products')
                .join('servers', 'products.server_id', 'servers.id')
                .where('products.id', payload.productId)
                .select('servers.*', 'products.install_scripts')
                .first();

            if (!product) {
                throw new Error('Mahsulot yoki server topilmadi');
            }

            // 2. SSH ulanish konfiguratsiyasi
            const sshConnection = new ssh.Client();

            sshConnection.on('ready', () => {
                sshConnection.shell({ term: 'xterm' }, (err, stream) => {
                    if (err) {
                        client.emit('installation_error', err.message);
                        return;
                    }

                    // 3. Sessiya yaratish
                    const session: ScriptSession = {
                        ssh: { client: sshConnection, shell: stream },
                        scripts: this.parseScripts(product.install_scripts),
                        currentScriptIndex: 0,
                        currentScript: '',
                        history: { commands: [], outputs: [] },
                    };

                    this.sessions.set(client.id, session);
                    this.executeNextScript(client, session);

                    // Shell output processing
                    stream.on('data', data => {
                        const output = data.toString();
                        this.processShellOutput(client, session, output);
                    });
                });
            });

            // SSH ulanish
            sshConnection.connect({
                host: product.ip_address,
                port: product.port,
                username: product.username,
                password: product.password,
            });
        } catch (error) {
            client.emit('installation_error', error.message);
        }
    }

    @SubscribeMessage('script_interaction_response')
    handleScriptInteraction(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        payload: {
            response: string;
        },
    ) {
        const session = this.sessions.get(client.id);
        if (!session || !session.awaitingPrompt) {
            client.emit('interaction_error', 'Hozirda javob kutilmayapti');
            return;
        }

        // Promptga javob yuborish
        session.ssh.shell.write(payload.response + '\n');
        session.awaitingPrompt = undefined;

        // Keyingi skriptni bajarish
        setTimeout(() => {
            this.executeNextScript(client, session);
        }, 500);
    }

    private parseScripts(scriptsText: string): string[] {
        return scriptsText
            .split('\n')
            .map(script => script.trim())
            .filter(script => script && !script.startsWith('#'));
    }

    private executeNextScript(client: Socket, session: ScriptSession) {
        if (session.currentScriptIndex >= session.scripts.length) {
            client.emit('installation_complete', 'Barcha skriptlar muvaffaqiyatli bajarildi');
            this.sessions.delete(client.id);
            return;
        }

        const script = session.scripts[session.currentScriptIndex];
        session.currentScript = script;
        session.history.commands.push(script);

        session.ssh.shell.write(script + '\n');
        session.currentScriptIndex++;
    }

    private processShellOutput(client: Socket, session: ScriptSession, output: string) {
        client.emit('script_output', output);

        // Sudo parol promti
        if (/\[sudo\] password for|Password:/.test(output)) {
            session.awaitingPrompt = {
                type: ScriptPromptType.PASSWORD,
                message: 'Sudo parolini kiriting',
                pattern: /password\s*:/i,
            };
            client.emit('script_prompt', {
                type: ScriptPromptType.PASSWORD,
                message: 'Sudo parolini kiriting',
            });
        }

        // Tasdiqlash promti
        else if (/\(Y\/n\)|\[yes\/no\]/.test(output)) {
            session.awaitingPrompt = {
                type: ScriptPromptType.CONFIRMATION,
                message: 'Tasdiqlaysizmi? (Y/n)',
                pattern: /\(Y\/n\)|\[yes\/no\]/i,
            };
            client.emit('script_prompt', {
                type: ScriptPromptType.CONFIRMATION,
                message: 'Tasdiqlaysizmi? (Y/n)',
            });
        }

        // Boshqa interaktiv kiritish
        else if (/\?|\[.*\]|Enter/.test(output)) {
            session.awaitingPrompt = {
                type: ScriptPromptType.INPUT,
                message: 'Qiymat kiriting',
                pattern: /:/,
            };
            client.emit('script_prompt', {
                type: ScriptPromptType.INPUT,
                message: 'Qiymat kiriting',
            });
        }
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const session = this.sessions.get(client.id);
        if (session) {
            session.ssh.client.end();
            this.sessions.delete(client.id);
        }
        console.log(`Client disconnected: ${client.id}`);
    }
}
