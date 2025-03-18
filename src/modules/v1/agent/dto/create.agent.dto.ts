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

export class NetworkAdapterDto {
    @IsString()
    @IsNotEmpty()
    nic_name: string;

    @IsIP()
    ip_address: string;

    @Matches(/^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/, { message: 'Invalid MAC address format' })
    mac_address: string;

    @IsString()
    available: 'Up' | 'Down';
}

export class DiskDto {
    @IsString()
    @IsNotEmpty()
    drive_name: string;


    @IsNumber()
    total_size: number;

    @IsNumber()
    free_size: number;
}

export class CreateAgentDto {
    @IsString()
    @IsNotEmpty()
    hostname: string;

    @IsString()
    @IsNotEmpty()
    operation_system: string;

    @IsString()
    @IsNotEmpty()
    platform: string;

    @IsString()
    @IsNotEmpty()
    build_number: string;

    @IsString()
    @IsNotEmpty()
    version: string;

    @IsNumber()
    ram: number;

    @IsString()
    @IsNotEmpty()
    cpu: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsNumber()
    cores: number;
  
    unical_key?: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NetworkAdapterDto)
    network_adapters: NetworkAdapterDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiskDto)
    disks: DiskDto[];
}
