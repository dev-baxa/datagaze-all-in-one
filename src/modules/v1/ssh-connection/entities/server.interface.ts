export interface IServer {
    id: string;
    ip_address: string;
    port: number;
    username: string;
    password?: string;
    private_key?: string;
}
