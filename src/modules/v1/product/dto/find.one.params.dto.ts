import { IsUUID } from 'class-validator';

export class findOneParamsDto {
    @IsUUID()
    id: string;
}
