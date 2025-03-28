import { Injectable } from '@nestjs/common';
import db from 'src/config/database.config';
import { ComputerInterface } from '../agent/entity/computer.interface';

@Injectable()
export class ComputerService {
    async getAllComputers(
        page: number,
        limit: number,
    ): Promise<{ computers: ComputerInterface[]; total: number; page: number }> {
        const total = await db('computers').count('id as total');
        const offset = (page - 1) * limit;

        const computers = await db('computers').select('*').limit(limit).offset(offset);
        return {
            computers,
            total: Number(total[0].total),
            page,
        };
    }
}
