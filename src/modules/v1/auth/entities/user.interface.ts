export interface IUser {
    id: string;
    username: string;
    fullname: string;
    email: string;
    password: string;
    role_id: string;
    createdAt?: Date;
    updatedAt?: Date;
}
