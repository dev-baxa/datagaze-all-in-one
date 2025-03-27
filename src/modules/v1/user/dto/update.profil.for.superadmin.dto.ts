import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateProfilDtoForSuperAdmin {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({ description: 'id', example: 'uuid' })
    id: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'username', example: 'superAdmin', required: false })
    username?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'email', example: 'example@gmail.com', required: false })
    email?: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(32)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    @ApiProperty({ description: 'password', example: 'strongPassword', required: false })
    password?: string;
}
