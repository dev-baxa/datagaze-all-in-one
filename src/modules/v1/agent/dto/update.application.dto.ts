import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplicationsDTO {
    @ApiProperty({ description: 'Application ID'  , example: '12345' })
    name: string;
  
    @ApiProperty({ description: 'Computer ID' , example: '67890' })
    computer_id?: string;
  
    @ApiProperty({ description: 'Application Version' , example: '1.0.0' })
    version: string;
  
    @ApiProperty({ description: 'Application Publisher'  , example: 'DATAGAZE' })
    installed_date: Date;
  
    @ApiProperty({ description: 'Application Publisher' , example: 'DATAGAZE' })
    type: string;
  
    @ApiProperty({ description: 'Application Publisher' , example: 'DATAGAZE' })
    size: number;
}
