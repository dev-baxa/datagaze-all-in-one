import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplicationsDTO {
    @ApiProperty({ description: 'name', example: 'Chrome' })
    name: string;

    computer_id?: string;

    @ApiProperty({ description: 'version', example: '1.0.0' })
    version: string;

    @ApiProperty({ description: 'installed_date', example: '2025-03-08T06:16:27.857Z' })
    installed_date: Date;

    @ApiProperty({ description: 'type', example: 'User' })
    type: string;

    @ApiProperty({ description: 'size', example: 5000030 })
    size: number;
}
