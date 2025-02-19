export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role_id: string;
    createdAt?: Date;
    updatedAt?: Date;
}
