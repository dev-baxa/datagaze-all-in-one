import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    publisher: string;

    @IsString()
    @IsNotEmpty()
    server_version: string;

    @IsString()
    @IsNotEmpty()
    agent_version: string;

    @IsString()
    @IsNotEmpty()
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
