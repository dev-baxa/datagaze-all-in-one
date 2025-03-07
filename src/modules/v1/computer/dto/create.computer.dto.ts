import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateComputerDTO {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    computer_name: string;

    @IsString()
    @IsNotEmpty()
    mac_address: string;

    @IsNumber()
    @IsNotEmpty()
    ram: number;

    @IsNumber()
    @IsNotEmpty()
    storage: number;
}