import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import db from 'src/config/database.config';
import { AgentAuthService } from 'src/modules/v1/agent/service/agent.auth.service';

@Injectable()
export class AgentAuthMiddleware implements NestMiddleware {
    constructor(private readonly agentAuthService: AgentAuthService) {}
    async use(req: Request, res: Response, next: NextFunction): Promise<void> {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Invalid or missing token');
        }

        const payload = await this.agentAuthService.verifyToken(token);

        if (!payload) {
            throw new UnauthorizedException('Invalid or missing token');
        }

        const validComputer = await db('computers').where('id', payload.id).first();

        if (!validComputer) {
            throw new UnauthorizedException('Invalid or missing token');
        }

        next();
    }
}
