export interface IServer {
    id: string;
    ip_address: string;
    port: number;
    username: string;
    os_type?: string;
    password?: string;
    private_key?: string;
}
