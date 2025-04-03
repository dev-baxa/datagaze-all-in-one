import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class connectDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    ip: string;

    @IsOptional()
    @IsNumber()
    port?: number;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsOptional()
    auth_type?: string;

    @IsOptional()
    @IsString()
    // @IsNotEmpty()
    private_key?: string;

    @IsOptional()
    @IsString()
    // @IsNotEmpty()
    password?: string;

    @IsOptional()
    @IsString()
    // @IsNotEmpty()
    passphrase?: string;
}
