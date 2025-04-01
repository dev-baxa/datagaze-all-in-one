import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'name', example: 'DLP' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'publisher', example: 'DATAGAZE' })
    publisher: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'server_version', example: '1.0.0' })
    server_version: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'agent_version', example: '1.0.0' })
    agent_version: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'install_scripts', example: 'echo "hello world"' })
    install_scripts: string;

    @IsString()
    @IsNotEmpty()
    update_scripts: string;

    @IsString()
    @IsNotEmpty()
    delete_scripts: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsString()
    @IsNotEmpty()
    min_requirements: string;
}
