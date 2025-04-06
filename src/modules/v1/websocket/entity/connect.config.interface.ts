export interface IConnectConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
    tryKeyboard?: boolean;
    keepaliveInterval?: number; // Added to support interactive prompts
}
