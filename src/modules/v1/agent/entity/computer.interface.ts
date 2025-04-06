import { DiskDto, NetworkAdapterDto } from '../dto/create.agent.dto';

export interface ComputerInterface {
    id: string;
    hostname: string;
    operation_system: string;
    platform: string;
    build_number: string;
    version: string;
    ram: number;
    cpu: string;
    model: string;
    cores: number;
    unicall_key?: string;
    network_adapters: NetworkAdapterDto[];
    disks: DiskDto[];
}

export interface ComputerPayloadInterface {
    id: string;
    hostname: string;
    operation_system: string;
    platform: string;
    unicall_key: string;
}
