import { Socket } from 'socket.io';

import { IScriptSession, ScriptPromptType } from '../entity/operation.types';
import { promptUser } from './user-prompt.helper';

export function executeNextScript(client: Socket, session: IScriptSession): void {
    if (session.currentScriptIndex >= session.scripts.length) {
        client.emit(
            `${session.operationType}_complete`,
            `Barcha skriptlar muvaffaqiyatli bajarildi`,
        );
        session.ssh.client.end();
        return;
    }

    const script = session.scripts[session.currentScriptIndex];
    session.currentScript = script;
    session.history.commands.push(script);

    session.ssh.shell.write(script + '\n');
    session.currentScriptIndex++;
}

export function processShellOutput(client: Socket, session: IScriptSession, output: string): void {
    client.emit('script_output', output);

    if (/\[sudo\] password for|Password:/.test(output)) {
        promptUser(client, session, ScriptPromptType.PASSWORD, 'Sudo parolini kiriting');
    } else if (/\(Y\/n\)|\[yes\/no\]/.test(output)) {
        promptUser(client, session, ScriptPromptType.CONFIRMATION, 'Tasdiqlaysizmi? (Y/n)');
    } else if (/\?|\[.*\]|Enter/.test(output)) {
        promptUser(client, session, ScriptPromptType.INPUT, 'Qiymat kiriting');
    }
}
