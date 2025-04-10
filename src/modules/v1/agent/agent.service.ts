import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/utils/base.service';
import { sortArrayOfObjects } from 'src/common/utils/sortArrayObjects';
import db from 'src/config/database.config';
import { env } from 'src/config/env';

import { CreateAgentDto } from './dto/create.agent.dto';
import { UpdateApplicationsDTO } from './dto/update.application.dto';
import { IComputer } from './entity/computer.interface';
import { AgentAuthService } from './service/agent.auth.service';

@Injectable()
export class AgentService extends BaseService<IComputer> {
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
        const isValidComp = await this.findByQueryOne({ unical_key: unicalKey });
        let statusCode: number;
        let result: IComputer;

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
            const isDataChanged =
                data.hostname !== isValidComp.hostname ||
                data.operation_system !== isValidComp.operation_system ||
                data.platform !== isValidComp.platform ||
                data.cpu !== isValidComp.cpu ||
                data.ram !== isValidComp.ram ||
                data.model !== isValidComp.model ||
                data.cores !== isValidComp.cores ||
                data.version !== isValidComp.version ||
                data.network_adapters.length !== isValidComp.network_adapters.length ||
                data.disks.length !== isValidComp.disks.length ||
                JSON.stringify(sortArrayOfObjects(data.network_adapters)) !==
                    JSON.stringify(sortArrayOfObjects(isValidComp.network_adapters)) ||
                JSON.stringify(sortArrayOfObjects(data.disks)) !==
                    JSON.stringify(sortArrayOfObjects(isValidComp.disks));

            if (isDataChanged) {
                result = await db('computers')
                    .where('unical_key', unicalKey)
                    .update({
                        ...data,
                        disks: JSON.stringify(data.disks),
                        network_adapters: JSON.stringify(data.network_adapters),
                    });
            } else result = isValidComp;

            statusCode = 200;
        }

        const agentTokenPayload = {
            id: result.id,
            hostname: result.hostname,
            operation_system: result.operation_system,
            platform: result.platform,
            unical_key: result.unical_key || '',
        };
        return {
            token: await this.authService.generateToken(agentTokenPayload),
            statusCode: statusCode,
        };
    }

    async updateApplications(data: UpdateApplicationsDTO[], computer: IComputer): Promise<void> {
        const oldingiApp = await db('apps').where('computer_id', computer.id);

        const newAppsMap = new Map(data.map(app => [app.name, app]));

        for (const app of oldingiApp) {
            const validApp = newAppsMap.get(app.name);
            if (validApp) {
                validApp.installed_date = new Date(validApp.installed_date);

                const isDataChanged = Object.keys(validApp).some(key => {
                    return String(validApp[key]) !== String(app[key]);
                });

                if (isDataChanged) {
                    validApp.updated_at = new Date();
                    await db('apps')
                        .where({ id: app.id })
                        .update({ ...validApp });
                }
                newAppsMap.delete(app.name); // Yangilangan yozuvni mapdan o'chirish
            } else {
                await db('apps').where({ name: app.name }).delete();
            }
        }

        for (const newApp of newAppsMap.values()) {
            newApp.computer_id = computer.id;
            await db('apps').insert(newApp);
        }
    }
}
