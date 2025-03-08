import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ComputerAuthService } from 'src/modules/v1/computer/service/computer.auth.service';

@Injectable()
export class JwtAuthForComputersGuard {
    constructor(private readonly authService: ComputerAuthService) {}
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
