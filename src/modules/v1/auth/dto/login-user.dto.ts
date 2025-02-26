import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Username should not be empty' })
    @MinLength(4, { message: 'Username must be at least 4 characters long' })
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
