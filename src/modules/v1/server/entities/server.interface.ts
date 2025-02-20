export interface Server {
    id: string,
    os_type:string,
    username:string,
    password?:string,
    private_key?:string,
    ip_addres:string,
    port:number,
    created_at?: Date , 
    updated_at?: Date
}