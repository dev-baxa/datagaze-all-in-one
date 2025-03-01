import { IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDTOForSuperAdmin {
    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(32)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    new_password: string;
}
