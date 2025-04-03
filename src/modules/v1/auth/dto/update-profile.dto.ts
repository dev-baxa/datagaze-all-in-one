import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username?: string;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    email?: string;
}
