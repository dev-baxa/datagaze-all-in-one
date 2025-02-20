import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateServerDTO{
    @IsString()
    @IsNotEmpty()
    name:string ;

    @IsString()
    @IsNotEmpty()
    username:string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    password?:string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    private_key?:string;

    @IsString()
    @IsNotEmpty()
    ip_address:string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(9999)
    port: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    os_type?:string

}