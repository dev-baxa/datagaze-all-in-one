import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class executeDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    command: string;
}
