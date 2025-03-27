import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDTOauth {
    @IsOptional()
    @ApiProperty({ description: 'old_password', example: 'password12131' })
    old_password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(32)
    // @IsStrongPassword()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    @ApiProperty({ description: 'new_password', example: 'password12131' })
    new_password: string;
}
