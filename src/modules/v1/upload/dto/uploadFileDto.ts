import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UploadFileDTO {
    @IsString()
    @IsNotEmpty()
    version: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['linux', 'windows'])
    os_type: string;

    @IsString()
    @IsNotEmpty()
    product_name: string;
}
