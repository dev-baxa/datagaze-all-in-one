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

export interface ScriptSession {
    ssh: { client: any; shell: any };
    scripts: string[];
    currentScriptIndex: number;
    currentScript: string;
    operationType: OperationType;
    awaitingPrompt?: { type: ScriptPromptType; message: string; pattern: RegExp };
    history: { commands: string[]; outputs: string[] };
}
