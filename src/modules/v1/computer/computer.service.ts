import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import db from 'src/config/database.config';
import { ENV } from 'src/config/env';
import { CreateComputerDTO } from './dto/create.computer.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';
import { ComputerInterface } from './entity/computer.interface';
import { ComputerAuthService } from './service/computer.auth.service';

@Injectable()
export class ComputerService extends BaseService<ComputerInterface> {
    constructor(private readonly authService: ComputerAuthService) {
        super('computers');
    }
    private secretKey = ENV.JWT_PRIVAT_KEY || '';

    async createComputerAndReturnToken(data: CreateComputerDTO): Promise<string> {
        const result = await db('computers')
            .insert(data)
            .onConflict('mac_address')
            .merge({
                mac_address: data.mac_address,
                username: data.username,
                computer_name: data.computer_name,
                ram: data.ram,
                storage: data.storage,
            })
            .returning('*');

        return await this.authService.generateToken(result[0]);
    }

    async updateApplications(
        data: UpdateApplicationsDTO[],
        computer: ComputerInterface,
    ): Promise<void> {
        console.log(computer);
        
        await db('apps').delete().where('computer_id', computer.id);

        data.forEach((item: { computer_id: string } & UpdateApplicationsDTO) => {
            item.computer_id = computer.id;
        });
        
        await db('apps').insert(data);
    }

    async getApplications(): Promise<UpdateApplicationsDTO[]> {
        return await db('apps').select('*');
    }
}
