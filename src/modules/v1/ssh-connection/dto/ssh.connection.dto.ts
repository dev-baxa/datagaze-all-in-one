import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConnectionDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'product_id', example: 'product_id' })
    product_id: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'ip',
        example: '170.64.141.16',
    })
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
    auth_type: 'password' | 'private_key';

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'password', example: 'ubuntuNew123' })
    password?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'private_key', example: 'private_key' })
    private_key?: string;
}
