import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ConnectionDTO {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    product_id: string;

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
