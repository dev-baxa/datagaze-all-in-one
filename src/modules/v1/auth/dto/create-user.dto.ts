import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'username', example: 'superAdmin' })
    username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'fullname', example: 'Super Admin' })
    fullname: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'email', example: 'exapmle@gmail.com' })
    email: string;

    @IsOptional()
    @IsUUID()
    role_id?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    // @IsStrongPassword()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    @ApiProperty({ description: 'password', example: 'Password123@' })
    password: string;
}
