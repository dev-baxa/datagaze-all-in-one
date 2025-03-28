import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDTOForSuperAdmin {
    @IsUUID()
    @IsNotEmpty()
        @ApiProperty({description:"user_id" , example:'uuid'} )
    user_id: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(32)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
        @ApiProperty({description:"new_password" , example:'strongPassword'})
    new_password: string;
}
