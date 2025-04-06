import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import db from 'src/config/database.config';
import { env } from 'src/config/env';

import { CreateAgentDto } from './dto/create.agent.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';
import { ComputerInterface } from './entity/computer.interface';
import { AgentAuthService } from './service/agent.auth.service';

@Injectable()
export class AgentService extends BaseService<ComputerInterface> {
    constructor(private readonly authService: AgentAuthService) {
        super('computers');
    }
    private secretKey = env.JWT_PRIVAT_KEY || '';

    async createComputerAndReturnToken(
        data: CreateAgentDto,
    ): Promise<{ token: string; statusCode: number }> {
        const unicalKey: string =
            data.build_number + data.network_adapters.map(item => item.mac_address).join('');
        data.unical_key = unicalKey;
        const isValidComp = (
            await db('computers')
                .where('unical_key', unicalKey)
                .update({
                    ...data,
                    disks: JSON.stringify(data.disks),
                    network_adapters: JSON.stringify(data.network_adapters),
                })
                .returning('*')
        )[0];

        let statusCode: number;
        let result: ComputerInterface;

        if (!isValidComp) {
            result = (
                await db('computers')
                    .insert({
                        ...data,
                        disks: JSON.stringify(data.disks),
                        network_adapters: JSON.stringify(data.network_adapters),
                    })
                    .returning('*')
            )[0];
            statusCode = 201;
        } else {
            result = isValidComp;
            statusCode = 200;
        }

        const agentTokenPayload = {
            id: result.id,
            hostname: result.hostname,
            operation_system: result.operation_system,
            platform: result.platform,
            unicall_key: result.unicall_key || '',
        };
        return {
            token: await this.authService.generateToken(agentTokenPayload),
            statusCode: statusCode,
        };
    }

    async updateApplications(
        data: UpdateApplicationsDTO[],
        computer: ComputerInterface,
    ): Promise<void> {
        await db('apps').delete().where('computer_id', computer.id);

        for (const item of data) {
            item.computer_id = computer.id; // UUID ekanligini tekshiring
            await db('apps').insert(item);
        }
    }
}
