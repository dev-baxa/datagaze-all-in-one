import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class installDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['linux', 'windows'])
    os_type: string;

    @IsString()
    @IsNotEmpty()
    version: string;

    @IsString()
    @IsNotEmpty()
    ip: string;

    @IsNotEmpty()
    @IsNumber()
    port: number;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    auth_type: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    private_key?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    password?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    passphrase?: string;
}
