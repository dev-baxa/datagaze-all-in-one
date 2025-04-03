export interface Product {
    id: string;
    name: string;
    server_id: string;
    description: string;
    min_requirements: string;
    publisher: string;
    server_version: string;
    agent_vesion: string;
    server_path: string;
    agent_path: string;
    icon_path: string;
    install_scripts: string;
    update_scripts: string;
    delete_scripts: string;
    created_at?: Date;
    updated_at?: Date;
}
