import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ExecuteDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    command: string;
}
