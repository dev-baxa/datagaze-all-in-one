import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
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

        request.computer = payload;
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers['authorization'] ?? '';

        const [type, token] = authHeader.split(' ');

        return type === 'Bearer' ? token : undefined;
    }
}
