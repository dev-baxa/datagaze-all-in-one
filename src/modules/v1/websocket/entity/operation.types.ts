import { ClientChannel , Client } from "ssh2";

export enum ScriptPromptType {
    PASSWORD = 'password',
    CONFIRMATION = 'confirmation',
    INPUT = 'input',
}

export enum OperationType {
    INSTALL = 'install',
    UPDATE = 'update',
    DELETE = 'delete',
}

export interface IScriptSession {
    ssh: { client: Client; shell: ClientChannel };
    scripts: string[];
    currentScriptIndex: number;
    currentScript: string;
    operationType: OperationType;
    awaitingPrompt?: { type: ScriptPromptType; message: string; pattern: RegExp };
    history: { commands: string[]; outputs: string[] };
}
