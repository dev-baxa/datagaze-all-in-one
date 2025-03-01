import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConnectionDTO {
    // @IsNotEmpty()
    // @IsString()
    // server_id: string;

    @IsNotEmpty()
    @IsString()
    ip: string;

    @IsNotEmpty()
    @IsNumber()
    port: number;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEnum(['password', 'private_key'])
    auth_type: 'password' | 'private_key';

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    private_key?: string;
}
