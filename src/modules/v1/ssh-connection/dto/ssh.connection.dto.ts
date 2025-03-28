import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConnectionDTO {
    // @IsNotEmpty()
    // @IsString()
    // server_id: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'ip', example: 'ip address or hostname' })
    ip: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'port', example: '22' })
    port: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'username', example: 'ubuntu' })
    username: string;

    @IsNotEmpty()
    @IsEnum(['password', 'private_key'])
    @ApiProperty({ description: 'auth_type', example: 'password', type: 'string' })
    @ApiProperty({ description: 'auth_type', example: 'private_key' })
    auth_type: 'password' | 'private_key';

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'password', example: 'password' })
    password?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'private_key', example: 'private_key' })
    private_key?: string;
}
