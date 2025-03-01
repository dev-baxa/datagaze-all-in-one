import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProfilDTO {
    @IsOptional()
    @IsString()
    @IsUUID()
    server_id?: string;

    @IsString()
    @IsEnum(['linux', 'windows'])
    @IsOptional()
    os_type?: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    min_requirements: string;

    @IsString()
    @IsNotEmpty()
    path: string;

    @IsObject()
    @IsNotEmpty()
    scripts: JSON;
}
