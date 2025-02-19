import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, Min, MinLength } from "class-validator";


export class UpdatePasswordDTO{
    @IsOptional()
    @IsUUID()
    user_id?: string;

    
    @IsOptional()
    old_password?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(32)
    // @IsStrongPassword()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    new_password: string;
}