export interface ServerInterface{
    id: string;
    name: string;
    os_type: string;
    username: string;
    password?: string;
    private_key?: string;
    ip_address: string;
    port: number;
    created_at?: Date;
    updated_at?: Date;
}
