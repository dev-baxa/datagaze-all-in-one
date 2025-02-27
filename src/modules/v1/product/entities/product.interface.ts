export interface Product{
    id: string;
    name: string;
    server_id?: string;
    os_type: string;
    description: string;
    min_requirements: string;
    version?: string;
    path:string;
    scripts: JSON;
    created_at?: Date;
    updated_at?: Date
}