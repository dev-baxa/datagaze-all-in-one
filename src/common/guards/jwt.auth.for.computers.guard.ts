import {
    ExecutionContext,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import db from 'src/config/database.config';
import { AgentAuthService } from 'src/modules/v1/agent/service/agent.auth.service';

@Injectable()
export class JwtAuthForComputersGuard {
    constructor(private readonly authService: AgentAuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        const payload = await this.authService.verifyToken(token);

        if (!payload) throw new UnauthorizedException('Invalid token');

        
        const validComputer = await db('computers').where('id', payload.id).first();
        
        if (!validComputer) throw new NotFoundException('Computer not found');

        request.computer = payload;
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers['authorization'] ?? '';

        const [type, token] = authHeader.split(' ');

        return type === 'Bearer' ? token : undefined;
    }
}
