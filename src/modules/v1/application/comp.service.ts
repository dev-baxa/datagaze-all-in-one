import { Injectable, NotFoundException } from '@nestjs/common';
import db from 'src/config/database.config';
import { AppInterface } from '../agent/entity/app.interface';
import { ComputerInterface } from '../agent/entity/computer.interface';
import { Socket } from 'socket.io';

@Injectable()
export class ComputerService {
    async getAllComputers(
        page: number,
        limit: number,
        agentConnections: Map<string, Socket>
    ): Promise<{ computers: ComputerInterface[]; total: number; page: number }> {
        const total = await db('computers').count('id as total');
        const offset = (page - 1) * limit;

        const computers = await db('computers').select('*').limit(limit).offset(offset);

        const computersWithStatus = computers.map((computer) => { 
            const isActive = agentConnections.has(computer.id)
            return {
                ...computer,
                status: isActive ? 'active' : 'inactive', // Statusni qo'shish
            };
        })

        computersWithStatus.sort((a, b) => {
            if (a.status === 'active' && b.status === 'inactive') return -1;
            if (a.status === 'inactive' && b.status === 'active') return 1;
            return 0;
        });

        return {
            computers: computersWithStatus,
            total: Number(total[0].total),
            page,
        };
    }
    async getComputerById(id: string): Promise<{ success: boolean; computer: ComputerInterface }> {
        const computer = await db('computers').where('id', id).first();
        if (!computer) throw new NotFoundException('Computer not found');
        return {
            success: true,
            computer
        };
    }

    async getApplicationByComputerId(
        computerId: string,
        page: number,
        limit: number,
    ): Promise<{ applications: AppInterface[]; total: number; page: number }> {
        const computer = await db('computers').where('id', computerId).first();
        if (!computer) throw new NotFoundException('Computer not found');
        const offset = (page - 1) * limit;
        const total = await db('apps').where('computer_id', computerId).count('id as total');
        const applications = await db('apps')
            .where('computer_id', computerId)
            .select('*')
            .limit(limit)
            .offset(offset);

        return {
            applications,
            total: Number(total[0].total),
            page,
        };
    }
}
