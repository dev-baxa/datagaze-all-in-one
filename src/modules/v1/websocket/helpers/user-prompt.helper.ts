import { Socket } from 'socket.io';

import { IScriptSession, ScriptPromptType } from '../entity/operation.types';

export function promptUser(
    client: Socket,
    session: IScriptSession,
    type: ScriptPromptType,
    message: string,
): void {
    session.awaitingPrompt = { type, message, pattern: /:/ };
    client.emit('script_prompt', { type, message });
}
