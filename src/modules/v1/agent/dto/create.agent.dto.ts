import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsArray,
    ValidateNested,
    IsIP,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class NetworkAdapterDto {
    @ApiProperty({ description: 'nic_name', example: 'Ethernet' })
    @IsString()
    @IsNotEmpty()
    nic_name: string;

    @ApiProperty({ description: 'ip_address', example: '192.168.1.100' })
    @IsIP()
    ip_address: string;

    @ApiProperty({description:"mac_address", example: "00:1A:2B:3C:4D:5E"})
    @Matches(/^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/, { message: 'Invalid MAC address format' })
    mac_address: string;

    @ApiProperty({description:'available', example:'Up'})
    @IsString()
    available: 'Up' | 'Down';
}

export class DiskDto {
    @ApiProperty({ description: 'drive_name', example: 'C:' })
    @IsString()
    @IsNotEmpty()
    drive_name: string;

    @ApiProperty({ description: 'total_size', example: 512000000000 })
    @IsNumber()
    total_size: number;

    @ApiProperty({ description: 'free_size', example: 500000000000 })
    @IsNumber()
    free_size: number;
}

export class CreateAgentDto {
    @ApiProperty({ description: 'hostname', example: 'DESKTOP-1234' })
    @IsString()
    @IsNotEmpty()
    hostname: string;

    @ApiProperty({ description: 'operation_system', example: 'windows' })
    @IsString()
    @IsNotEmpty()
    operation_system: string;

    @ApiProperty({ description: 'platform', example: '64-bit' })
    @IsString()
    @IsNotEmpty()
    platform: string;

    @ApiProperty({ description: 'build_number', example: '190451' })
    @IsString()
    @IsNotEmpty()
    build_number: string;

    @ApiProperty({ description: 'version', example: '10.0.19045' })
    @IsString()
    @IsNotEmpty()
    version: string;

    @ApiProperty({ description: 'ram', example: 16384 })
    @IsNumber()
    ram: number;

    @ApiProperty({ description: 'cpu', example: 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz' })
    @IsString()
    @IsNotEmpty()
    cpu: string;

    @ApiProperty({ description: 'model', example: 'Dell XPS 15' })
    @IsString()
    @IsNotEmpty()
    model: string;

    @ApiProperty({ description: 'cores', example: 6 })
    @IsNumber()
    cores: number;

    unical_key?: string;

    @ApiProperty({ description: 'netword_adapters', type: [NetworkAdapterDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NetworkAdapterDto)
    network_adapters: NetworkAdapterDto[];

    @ApiProperty({ description: 'disks', type: [DiskDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiskDto)
    disks: DiskDto[];
}
