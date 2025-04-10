import { DiskDto, NetworkAdapterDto } from '../dto/create.agent.dto';

export interface IComputer {
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
    unical_key?: string;
    network_adapters: NetworkAdapterDto[];
    disks: DiskDto[];
}

export interface IComputerPayload {
    id: string;
    hostname: string;
    operation_system: string;
    platform: string;
    unicall_key: string;
}
